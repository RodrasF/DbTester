using DbTester.Application.Interfaces;
using DbTester.Application.UserManagement;
using DbTester.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DbTester.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ITestUserRepository _userRepository;
    private readonly IDatabaseConnectionRepository _connectionRepository;
    private readonly IEncryptionService _encryptionService;

    public UsersController(
        ITestUserRepository userRepository,
        IDatabaseConnectionRepository connectionRepository,
        IEncryptionService encryptionService)
    {
        _userRepository = userRepository;
        _connectionRepository = connectionRepository;
        _encryptionService = encryptionService;
    }

    [HttpGet]
    public async Task<ActionResult<TestUserListResponse>> GetAllUsers()
    {
        var users = await _userRepository.GetAllAsync();

        var response = new TestUserListResponse
        {
            Success = true,
            Message = "Users retrieved successfully",
            Users = users.Select(MapToDto).ToList()
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
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new TestUserResponse
            {
                Success = false,
                Message = "Name, username, and password are required"
            });
        }
        var user = new TestUser
        {
            Name = request.Name,
            Username = request.Username,
            EncryptedPassword = _encryptionService.Encrypt(request.Password),
            AssignedRole = request.AssignedRole,
            ExpectedPermissions = request.ExpectedPermissions.Select(p => new UserPermission
            {
                Permission = p.Permission,
                ObjectName = p.ObjectName,
                IsGranted = p.IsGranted
            }).ToList()
        };

        var createdUser = await _userRepository.AddAsync(user);

        var response = new TestUserResponse
        {
            Success = true,
            Message = "User created successfully",
            User = MapToDto(createdUser)
        };

        return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, response);
    }

    [HttpPut("{id:guid}")]
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

        var existingUser = await _userRepository.GetByIdAsync(id);

        if (existingUser == null)
        {
            return NotFound(new TestUserResponse
            {
                Success = false,
                Message = "User not found"
            });
        }
        existingUser.Name = request.Name;
        existingUser.Username = request.Username;

        // Only update password if a new one was provided
        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            existingUser.EncryptedPassword = _encryptionService.Encrypt(request.Password);
        }

        existingUser.AssignedRole = request.AssignedRole;

        // Update permissions
        existingUser.ExpectedPermissions.Clear();
        existingUser.ExpectedPermissions.AddRange(request.ExpectedPermissions.Select(p => new UserPermission
        {
            Permission = p.Permission,
            ObjectName = p.ObjectName,
            IsGranted = p.IsGranted
        }));

        await _userRepository.UpdateAsync(existingUser);

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
    [HttpPost("verify")]
    public async Task<ActionResult<VerifyUserExistsResponse>> VerifyUserExists(VerifyUserExistsRequest request)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);

        if (user == null)
        {
            return NotFound(new VerifyUserExistsResponse
            {
                Success = false,
                Message = "User not found"
            });
        }

        var connection = await _connectionRepository.GetByIdAsync(request.ConnectionId);

        if (connection == null)
        {
            return NotFound(new VerifyUserExistsResponse
            {
                Success = false,
                Message = "Connection not found"
            });
        }

        var exists = await _userRepository.VerifyUserExistsInDatabaseAsync(user, connection);

        return Ok(new VerifyUserExistsResponse
        {
            Success = true,
            Message = exists ? "User exists in database" : "User does not exist in database",
            Exists = exists
        });
    }
    private static TestUserDto MapToDto(TestUser user)
    {
        return new TestUserDto
        {
            Id = user.Id,
            Name = user.Name,
            Username = user.Username,
            AssignedRole = user.AssignedRole,
            ExpectedPermissions = user.ExpectedPermissions.Select(p => new UserPermissionDto
            {
                Permission = p.Permission,
                ObjectName = p.ObjectName,
                IsGranted = p.IsGranted
            }).ToList(),
            CreatedAt = user.CreatedAt,
            ModifiedAt = user.ModifiedAt
        };
    }
}