using DbTester.Application.Interfaces;
using DbTester.Application.UserManagement;
using DbTester.Domain.Entities;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace DbTester.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ITestUserRepository _userRepository;
    private readonly IDatabaseConnectionRepository _connectionRepository;
    private readonly IEncryptionService _encryptionService;
    private readonly IValidator<CreateTestUserRequest> _createUserValidator;
    private readonly IValidator<UpdateTestUserRequest> _updateUserValidator;

    public UsersController(
        ITestUserRepository userRepository,
        IDatabaseConnectionRepository connectionRepository,
        IEncryptionService encryptionService,
        IValidator<CreateTestUserRequest> createUserValidator,
        IValidator<UpdateTestUserRequest> updateUserValidator)
    {
        _userRepository = userRepository;
        _connectionRepository = connectionRepository;
        _encryptionService = encryptionService;
        _createUserValidator = createUserValidator;
        _updateUserValidator = updateUserValidator;
    }

    [HttpGet]
    public async Task<ActionResult<TestUserListResponse>> GetAllUsers()
    {
        var users = await _userRepository.GetAllAsync();

        var response = new TestUserListResponse
        {
            Success = true,
            Message = "Users retrieved successfully",
            Users = [.. users.Select(MapToDto)]
        };

        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TestUserResponse>> GetUser(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
        {
            return NotFound(new TestUserResponse
            {
                Success = false,
                Message = "User not found"
            });
        }

        var response = new TestUserResponse
        {
            Success = true,
            Message = "User retrieved successfully",
            User = MapToDto(user)
        };

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<TestUserResponse>> CreateUser(CreateTestUserRequest request)
    {
        var validationResult = await _createUserValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new TestUserResponse
            {
                Success = false,
                Message = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage))
            });
        }

        // Find the connection first since it's required
        var connection = await _connectionRepository.GetByIdAsync(request.ConnectionId);
        if (connection == null)
        {
            return BadRequest(new TestUserResponse
            {
                Success = false,
                Message = "Invalid connection ID"
            });
        }

        var user = new TestUser
        {
            Username = request.Username,
            EncryptedPassword = _encryptionService.Encrypt(request.Password),
            ConnectionId = request.ConnectionId,
            Connection = connection,
            Description = request.Description,
            ExpectedPermissions = [.. request.ExpectedPermissions.Select(p => new UserPermission
            {
                Permission = p.Permission,
                ObjectName = p.ObjectName,
                IsGranted = p.IsGranted
            })]
        };

        var createdUser = await _userRepository.AddAsync(user);

        var isValid = await _userRepository.ValidateUserAsync(createdUser, request.Password);

        var response = new TestUserResponse
        {
            Success = true,
            Message = "User created successfully",
            User = MapToDto(createdUser)
        };

        return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, response);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<TestUserResponse>> UpdateUser(Guid id, UpdateTestUserRequest request)
    {
        if (id != request.Id)
        {
            return BadRequest(new TestUserResponse
            {
                Success = false,
                Message = "ID in URL does not match ID in request body"
            });
        }

        var validationResult = await _updateUserValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new TestUserResponse
            {
                Success = false,
                Message = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage))
            });
        }

        var existingUser = await _userRepository.GetByIdAsync(id);
        if (existingUser == null)
        {
            return NotFound(new TestUserResponse
            {
                Success = false,
                Message = "User not found"
            });
        }

        if (request.Username != null && request.Username != existingUser.Username)
        {
            var existingUserWithSameUsername = await _userRepository.GetByUsernameAsync(request.Username);
            if (existingUserWithSameUsername != null && existingUserWithSameUsername.Id != id)
            {
                return BadRequest(new TestUserResponse
                {
                    Success = false,
                    Message = "Username already exists"
                });
            }
            existingUser.Username = request.Username;
        }

        var encryptedPassword = _encryptionService.Encrypt(request.Password ?? string.Empty);
        if (request.Password != null && encryptedPassword != existingUser.EncryptedPassword)
        {
            existingUser.EncryptedPassword = encryptedPassword;
        }

        if (request.ConnectionId.HasValue && request.ConnectionId.Value != existingUser.ConnectionId)
        {
            var connection = await _connectionRepository.GetByIdAsync(request.ConnectionId.Value);
            if (connection == null)
            {
                return BadRequest(new TestUserResponse
                {
                    Success = false,
                    Message = "Invalid connection ID"
                });
            }

            existingUser.ConnectionId = request.ConnectionId.Value;
            existingUser.Connection = connection;
        }

        if (request.Description != null && request.Description != existingUser.Description)
        {
            existingUser.Description = request.Description;
        }

        if (request.ExpectedPermissions != null)
        {
            existingUser.ExpectedPermissions.Clear();
            existingUser.ExpectedPermissions.AddRange(request.ExpectedPermissions.Select(p => new UserPermission
            {
                Permission = p.Permission,
                ObjectName = p.ObjectName,
                IsGranted = p.IsGranted
            }));
        }

        await _userRepository.UpdateAsync(existingUser);

        var isValid = await _userRepository.ValidateUserAsync(existingUser, _encryptionService.Decrypt(existingUser.EncryptedPassword));

        var response = new TestUserResponse
        {
            Success = true,
            Message = "User updated successfully",
            User = MapToDto(existingUser)
        };

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<TestUserResponse>> DeleteUser(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
        {
            return NotFound(new TestUserResponse
            {
                Success = false,
                Message = "User not found"
            });
        }

        await _userRepository.DeleteAsync(user);

        return Ok(new TestUserResponse
        {
            Success = true,
            Message = "User deleted successfully"
        });
    }

    [HttpPost("validate")]
    public async Task<ActionResult<ValidateUserResponse>> ValidateUser(ValidateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user == null)
        {
            return NotFound(new ValidateUserResponse
            {
                Success = false,
                Message = "User not found"
            });
        }

        var isValid = await _userRepository.ValidateUserAsync(user, _encryptionService.Decrypt(user.EncryptedPassword));

        return Ok(new ValidateUserResponse
        {
            Success = true,
            Message = isValid ? "User is valid" : "User is not valid",
            IsValid = isValid
        });
    }

    private TestUserDto MapToDto(TestUser user)
    {
        return new TestUserDto
        {
            Id = user.Id,
            Username = user.Username,
            ConnectionId = user.ConnectionId,
            ConnectionName = user.Connection?.Name,
            Description = user.Description,
            ExpectedPermissions = [.. user.ExpectedPermissions.Select(p => new UserPermissionDto
            {
                Permission = p.Permission,
                ObjectName = p.ObjectName,
                IsGranted = p.IsGranted
            })],
            CreatedAt = user.CreatedAt,
            ModifiedAt = user.ModifiedAt,
            IsValid = user.IsValid,
            LastValidationDate = user.LastValidationDate
        };
    }
}