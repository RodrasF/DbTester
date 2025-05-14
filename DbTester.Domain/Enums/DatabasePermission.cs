namespace DbTester.Domain.Enums;

public enum DatabasePermission
{
    // Basic operations
    SELECT,
    INSERT,
    UPDATE,
    DELETE,

    // DDL operations
    CREATE,
    ALTER,
    DROP,
    TRUNCATE,

    // Additional permissions
    REFERENCES,
    TRIGGER,
    USAGE,
    CONNECT,
    TEMPORARY,
    EXECUTE
}