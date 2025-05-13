using DbTester.Domain.Entities;
using DbTester.Domain.Enums;

namespace DbTester.Application.Interfaces;

public interface IDatabaseService
{
    Task<bool> TestConnectionAsync(DatabaseConnection connection);

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

    // User management in database
    Task<bool> CreateUserAsync(DatabaseConnection connection, TestUser user);
    Task<bool> DropUserAsync(DatabaseConnection connection, string username);

    // Returns the connection string for a given connection
    string GetConnectionString(DatabaseConnection connection, string? username = null, string? password = null);
}