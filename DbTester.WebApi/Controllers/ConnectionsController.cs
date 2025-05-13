using DbTester.Application.ConnectionManagement;
using DbTester.Application.Interfaces;
using DbTester.Domain.Entities;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace DbTester.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConnectionsController : ControllerBase
{
    private readonly IDatabaseConnectionRepository _connectionRepository;
    private readonly IDatabaseService _databaseService;
    private readonly IEncryptionService _encryptionService;
    private readonly IValidator<CreateDatabaseConnectionRequest> _createValidator;
    private readonly IValidator<UpdateDatabaseConnectionRequest> _updateValidator;
    private readonly IValidator<TestConnectionRequest> _testValidator;

    public ConnectionsController(
        IDatabaseConnectionRepository connectionRepository,
        IDatabaseService databaseService,
        IEncryptionService encryptionService,
        IValidator<CreateDatabaseConnectionRequest> createValidator,
        IValidator<UpdateDatabaseConnectionRequest> updateValidator,
        IValidator<TestConnectionRequest> testValidator)
    {
        _connectionRepository = connectionRepository;
        _databaseService = databaseService;
        _encryptionService = encryptionService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _testValidator = testValidator;
    }

    [HttpGet]
    public async Task<ActionResult<DatabaseConnectionListResponse>> GetAllConnections()
    {
        var connections = await _connectionRepository.GetAllAsync();

        var response = new DatabaseConnectionListResponse
        {
            Success = true,
            Message = "Connections retrieved successfully",
            Connections = connections.Select(MapToDto).ToList()
        };

        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DatabaseConnectionResponse>> GetConnection(Guid id)
    {
        var connection = await _connectionRepository.GetByIdAsync(id);

        if (connection == null)
        {
            return NotFound(new DatabaseConnectionResponse
            {
                Success = false,
                Message = "Connection not found"
            });
        }

        var response = new DatabaseConnectionResponse
        {
            Success = true,
            Message = "Connection retrieved successfully",
            Connection = MapToDto(connection)
        };

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<DatabaseConnectionResponse>> CreateConnection(CreateDatabaseConnectionRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);

        if (!validationResult.IsValid)
        {
            return BadRequest(new DatabaseConnectionResponse
            {
                Success = false,
                Message = "Validation failed: " + string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage))
            });
        }

        var connection = new DatabaseConnection
        {
            Name = request.Name,
            Server = request.Server,
            Port = request.Port,
            DatabaseName = request.DatabaseName,
            EncryptedUsername = _encryptionService.Encrypt(request.Username),
            EncryptedPassword = _encryptionService.Encrypt(request.Password),
            MaxPoolSize = request.MaxPoolSize,
            MinPoolSize = request.MinPoolSize,
            ConnectionTimeout = request.ConnectionTimeout
        };

        // Test connection before saving
        var isValid = await _databaseService.TestConnectionAsync(connection);
        connection.IsConnectionValid = isValid;
        connection.LastConnectionTest = DateTime.UtcNow;

        if (!isValid)
        {
            return BadRequest(new DatabaseConnectionResponse
            {
                Success = false,
                Message = "Could not connect to the database with the provided credentials"
            });
        }

        var createdConnection = await _connectionRepository.AddAsync(connection);

        var response = new DatabaseConnectionResponse
        {
            Success = true,
            Message = "Connection created successfully",
            Connection = MapToDto(createdConnection)
        };

        return CreatedAtAction(nameof(GetConnection), new { id = createdConnection.Id }, response);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<DatabaseConnectionResponse>> UpdateConnection(Guid id, UpdateDatabaseConnectionRequest request)
    {
        if (id != request.Id)
        {
            return BadRequest(new DatabaseConnectionResponse
            {
                Success = false,
                Message = "ID in URL does not match ID in request body"
            });
        }

        var validationResult = await _updateValidator.ValidateAsync(request);

        if (!validationResult.IsValid)
        {
            return BadRequest(new DatabaseConnectionResponse
            {
                Success = false,
                Message = "Validation failed: " + string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage))
            });
        }

        var existingConnection = await _connectionRepository.GetByIdAsync(id);

        if (existingConnection == null)
        {
            return NotFound(new DatabaseConnectionResponse
            {
                Success = false,
                Message = "Connection not found"
            });
        }

        existingConnection.Name = request.Name;
        existingConnection.Server = request.Server;
        existingConnection.Port = request.Port;
        existingConnection.DatabaseName = request.DatabaseName;
        existingConnection.EncryptedUsername = _encryptionService.Encrypt(request.Username);

        // Only update password if a new one was provided
        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            existingConnection.EncryptedPassword = _encryptionService.Encrypt(request.Password);
        }

        existingConnection.MaxPoolSize = request.MaxPoolSize;
        existingConnection.MinPoolSize = request.MinPoolSize;
        existingConnection.ConnectionTimeout = request.ConnectionTimeout;

        // Test connection before updating
        var isValid = await _databaseService.TestConnectionAsync(existingConnection);
        existingConnection.IsConnectionValid = isValid;
        existingConnection.LastConnectionTest = DateTime.UtcNow;

        if (!isValid)
        {
            return BadRequest(new DatabaseConnectionResponse
            {
                Success = false,
                Message = "Could not connect to the database with the updated credentials"
            });
        }

        await _connectionRepository.UpdateAsync(existingConnection);

        var response = new DatabaseConnectionResponse
        {
            Success = true,
            Message = "Connection updated successfully",
            Connection = MapToDto(existingConnection)
        };

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<DatabaseConnectionResponse>> DeleteConnection(Guid id)
    {
        var connection = await _connectionRepository.GetByIdAsync(id);

        if (connection == null)
        {
            return NotFound(new DatabaseConnectionResponse
            {
                Success = false,
                Message = "Connection not found"
            });
        }

        await _connectionRepository.DeleteAsync(connection);

        return Ok(new DatabaseConnectionResponse
        {
            Success = true,
            Message = "Connection deleted successfully"
        });
    }

    [HttpPost("test")]
    public async Task<ActionResult<TestConnectionResponse>> TestConnection(TestConnectionRequest request)
    {
        var validationResult = await _testValidator.ValidateAsync(request);

        if (!validationResult.IsValid)
        {
            return BadRequest(new TestConnectionResponse
            {
                Success = false,
                Message = "Validation failed: " + string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage))
            });
        }

        bool isValid;

        if (request.Id.HasValue)
        {
            // Test existing connection
            var connection = await _connectionRepository.GetByIdAsync(request.Id.Value);

            if (connection == null)
            {
                return NotFound(new TestConnectionResponse
                {
                    Success = false,
                    Message = "Connection not found"
                });
            }

            isValid = await _databaseService.TestConnectionAsync(connection);

            // Update connection status
            connection.IsConnectionValid = isValid;
            connection.LastConnectionTest = DateTime.UtcNow;
            await _connectionRepository.UpdateAsync(connection);
        }
        else
        {
            // Test new connection details
            var connection = new DatabaseConnection
            {
                Server = request.Server!,
                Port = request.Port,
                DatabaseName = request.DatabaseName!,
                EncryptedUsername = _encryptionService.Encrypt(request.Username!),
                EncryptedPassword = _encryptionService.Encrypt(request.Password!)
            };

            isValid = await _databaseService.TestConnectionAsync(connection);
        }

        return Ok(new TestConnectionResponse
        {
            Success = true,
            Message = isValid ? "Connection successful" : "Connection failed",
            IsConnectionValid = isValid
        });
    }

    private static DatabaseConnectionDto MapToDto(DatabaseConnection connection)
    {
        return new DatabaseConnectionDto
        {
            Id = connection.Id,
            Name = connection.Name,
            Server = connection.Server,
            Port = connection.Port,
            DatabaseName = connection.DatabaseName,
            Username = connection.EncryptedUsername, // Note: This is still encrypted
            Password = "", // Don't return the password
            MaxPoolSize = connection.MaxPoolSize,
            MinPoolSize = connection.MinPoolSize,
            ConnectionTimeout = connection.ConnectionTimeout,
            IsConnectionValid = connection.IsConnectionValid,
            LastConnectionTest = connection.LastConnectionTest,
            CreatedAt = connection.CreatedAt,
            ModifiedAt = connection.ModifiedAt
        };
    }
}