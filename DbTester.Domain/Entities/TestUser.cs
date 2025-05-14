using DbTester.Domain.Common;
using DbTester.Domain.Enums;

namespace DbTester.Domain.Entities;

public class TestUser : BaseEntity
{
    public string Username { get; set; } = string.Empty;

    // Password is stored encrypted
    public string EncryptedPassword { get; set; } = string.Empty;

    // Connection this user belongs to
    public Guid ConnectionId { get; set; }
    public DatabaseConnection? Connection { get; set; }

    // User description
    public string? Description { get; set; }

    // Expected permissions for this user
    public List<UserPermission> ExpectedPermissions { get; set; } = new List<UserPermission>();

    // Validation status
    public bool IsValid { get; set; }
    public DateTime? LastValidationDate { get; set; }
}

public class UserPermission
{
    public DatabasePermission Permission { get; set; }
    public string? ObjectName { get; set; }  // Table/view/procedure name the permission applies to (if applicable)
    public bool IsGranted { get; set; }      // True if user should have this permission, false if they should not
}