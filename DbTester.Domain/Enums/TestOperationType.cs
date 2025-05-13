namespace DbTester.Domain.Enums;

public enum TestOperationType
{
    // Database schema operations
    CreateTable,
    ModifyTable,
    DropTable,

    // CRUD operations
    Insert,
    Select,
    Update,
    Delete,

    // Stored procedure and function operations
    ExecuteStoredProcedure,
    ExecuteFunction,

    // View operations
    CreateView,
    ModifyView,
    DropView,

    // Permission operations
    GrantPermission,
    RevokePermission,

    // Verification operations
    VerifyPermission,
    VerifyNoPermission,

    // Other operations
    ExecuteRawSql
}