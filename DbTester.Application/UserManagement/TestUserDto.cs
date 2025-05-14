using DbTester.Application.Common;
using DbTester.Domain.Enums;

namespace DbTester.Application.UserManagement;

public class TestUserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public Guid ConnectionId { get; set; }
    public string? ConnectionName { get; set; }
    public string? Description { get; set; }
    public List<UserPermissionDto> ExpectedPermissions { get; set; } = new List<UserPermissionDto>();
    public DateTime CreatedAt { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public bool IsValid { get; set; }
    public DateTime? LastValidationDate { get; set; }
}

public class UserPermissionDto
{
    public DatabasePermission Permission { get; set; }
    public string? ObjectName { get; set; }
    public bool IsGranted { get; set; }
}

public class CreateTestUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Guid ConnectionId { get; set; }
    public string? Description { get; set; }
    public List<UserPermissionDto> ExpectedPermissions { get; set; } = new List<UserPermissionDto>();
}

public class UpdateTestUserRequest
{
    public Guid Id { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public Guid? ConnectionId { get; set; }
    public string? Description { get; set; }
    public List<UserPermissionDto>? ExpectedPermissions { get; set; }
}

public class TestUserResponse : BaseResponse
{
    public TestUserDto? User { get; set; }
}

public class TestUserListResponse : BaseResponse
{
    public List<TestUserDto> Users { get; set; } = new List<TestUserDto>();
}

public class VerifyUserExistsRequest
{
    public Guid UserId { get; set; }
    public Guid ConnectionId { get; set; }
}

public class VerifyUserExistsResponse : BaseResponse
{
    public bool Exists { get; set; }
}