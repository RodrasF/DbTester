namespace DbTester.Domain.Enums;

public enum DatabasePermission
{
    // Table operations
    CreateTable,
    DropTable,
    SelectTable,
    InsertTable,
    UpdateTable,
    DeleteTable,

    // Other database objects
    ExecuteStoredProcedure,
    ExecuteFunction,
    CreateView,
    ModifyView,
    CreateIndex,

    // Security operations
    GrantPermission,
    RevokePermission,

    // System access
    AccessSystemTables,
    AccessInformationSchema
}