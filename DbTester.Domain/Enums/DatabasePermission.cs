using System.Text.Json.Serialization;

namespace DbTester.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
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