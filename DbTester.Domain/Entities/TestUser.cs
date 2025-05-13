using DbTester.Domain.Common;
using DbTester.Domain.Enums;

namespace DbTester.Domain.Entities;

public class TestUser : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;

    // Password is stored encrypted
    public string EncryptedPassword { get; set; } = string.Empty;

    // Expected permissions for this user
    public List<UserPermission> ExpectedPermissions { get; set; } = new List<UserPermission>();

    // Role assignment (if applicable)
    public string? AssignedRole { get; set; }

    // For temporary test users - if true, user will be created before test and dropped after
    public bool IsTemporary { get; set; }
}

public class UserPermission
{
    public DatabasePermission Permission { get; set; }
    public string? ObjectName { get; set; }  // Table/view/procedure name the permission applies to (if applicable)
    public bool IsGranted { get; set; }      // True if user should have this permission, false if they should not
}