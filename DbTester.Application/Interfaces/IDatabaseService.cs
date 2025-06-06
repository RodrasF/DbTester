using DbTester.Domain.Entities;
using DbTester.Domain.Enums;

namespace DbTester.Application.Interfaces;

public interface IDatabaseService
{
    Task<bool> TestConnectionAsync(DatabaseConnection connection, string? username = null, string? password = null);

    // SQL execution
    Task<(bool Success, string? ErrorMessage, object? Results)> ExecuteSqlAsync(
        DatabaseConnection connection,
        string sql,
        object? parameters = null,
        string username = "",
        string password = "");

    // Permission testing
    Task<(bool HasPermission, string? ErrorMessage)> TestPermissionAsync(
        DatabaseConnection connection,
        TestUser user,
        DatabasePermission permission,
        string? objectName = null);

    // Returns the connection string for a given connection
    string GetConnectionString(DatabaseConnection connection, string? username = null, string? password = null);
}