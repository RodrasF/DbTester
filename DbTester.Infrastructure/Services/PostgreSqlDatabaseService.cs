using Dapper;
using DbTester.Application.Interfaces;
using DbTester.Domain.Entities;
using DbTester.Domain.Enums;
using Npgsql;
using System.Data;

namespace DbTester.Infrastructure.Services;

public class PostgreSqlDatabaseService : IDatabaseService
{
    private readonly IEncryptionService _encryptionService;

    public PostgreSqlDatabaseService(IEncryptionService encryptionService)
    {
        _encryptionService = encryptionService;
    }

    public string GetConnectionString(DatabaseConnection connection, string? username = null, string? password = null)
    {
        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = connection.Server,
            Port = connection.Port,
            Database = connection.DatabaseName,
            Username = username ?? connection.Username,
            Password = password ?? _encryptionService.Decrypt(connection.EncryptedPassword),
            MaxPoolSize = connection.MaxPoolSize,
            MinPoolSize = connection.MinPoolSize,
            Timeout = connection.ConnectionTimeout
        };

        return builder.ToString();
    }

    public async Task<bool> TestConnectionAsync(DatabaseConnection connection)
    {
        try
        {
            await using var dbConnection = new NpgsqlConnection(GetConnectionString(connection));
            await dbConnection.OpenAsync();
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<(bool Success, string? ErrorMessage, object? Results)> ExecuteSqlAsync(
        DatabaseConnection connection,
        string sql,
        object? parameters = null,
        string username = "",
        string password = "")
    {
        try
        {
            string connectionString;

            if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
            {
                connectionString = GetConnectionString(connection, username, password);
            }
            else
            {
                connectionString = GetConnectionString(connection);
            }

            await using var dbConnection = new NpgsqlConnection(connectionString);
            await dbConnection.OpenAsync();

            var commandType = CommandType.Text;

            if (sql.Trim().ToLower().StartsWith("select"))
            {
                // For SELECT queries, return the results
                var results = await dbConnection.QueryAsync(sql, parameters, commandType: commandType);
                return (true, null, results);
            }
            else
            {
                // For non-SELECT queries, return affected rows count
                var affectedRows = await dbConnection.ExecuteAsync(sql, parameters, commandType: commandType);
                return (true, null, affectedRows);
            }
        }
        catch (Exception ex)
        {
            return (false, ex.Message, null);
        }
    }
    public async Task<(bool HasPermission, string? ErrorMessage)> TestPermissionAsync(
        DatabaseConnection connection,
        TestUser user,
        DatabasePermission permission,
        string? objectName = null)
    {
        string sql;
        try
        {
            switch (permission)
            {
                case DatabasePermission.CREATE:
                    sql = "CREATE TABLE temp_permission_test (id int); DROP TABLE temp_permission_test;";
                    break;

                case DatabasePermission.DROP:
                    sql = "CREATE TABLE temp_permission_test (id int); DROP TABLE temp_permission_test;";
                    break;

                case DatabasePermission.SELECT:
                    if (string.IsNullOrEmpty(objectName))
                    {
                        return (false, "Table name is required for SELECT permission test");
                    }
                    sql = $"SELECT * FROM {objectName} LIMIT 1";
                    break;

                case DatabasePermission.INSERT:
                    if (string.IsNullOrEmpty(objectName))
                    {
                        return (false, "Table name is required for INSERT permission test");
                    }
                    // This uses DO which doesn't actually insert but tests permission
                    sql = $@"DO $$ 
                            DECLARE
                                column_names text;
                                column_values text;
                            BEGIN
                                SELECT 
                                    string_agg(column_name, ', '), 
                                    string_agg('NULL', ', ')
                                INTO
                                    column_names, 
                                    column_values
                                FROM 
                                    information_schema.columns 
                                WHERE 
                                    table_name = '{objectName}' 
                                    AND table_schema = 'public'
                                    LIMIT 1;
                            
                                IF column_names IS NOT NULL THEN
                                    EXECUTE 'EXPLAIN INSERT INTO {objectName} (' || column_names || ') VALUES (' || column_values || ')';
                                END IF;
                            END $$;";
                    break;

                case DatabasePermission.UPDATE:
                    if (string.IsNullOrEmpty(objectName))
                    {
                        return (false, "Table name is required for UPDATE permission test");
                    }
                    sql = $"DO $$ BEGIN EXECUTE 'EXPLAIN UPDATE {objectName} SET dummy = dummy WHERE 1=0'; EXCEPTION WHEN undefined_column THEN NULL; END $$;";
                    break;

                case DatabasePermission.DELETE:
                    if (string.IsNullOrEmpty(objectName))
                    {
                        return (false, "Table name is required for DELETE permission test");
                    }
                    sql = $"EXPLAIN DELETE FROM {objectName} WHERE 1=0";
                    break;

                case DatabasePermission.EXECUTE:
                    if (string.IsNullOrEmpty(objectName))
                    {
                        return (false, "Procedure/Function name is required for EXECUTE permission test");
                    }
                    // Check if the function exists and is executable by the user
                    sql = $@"SELECT 1 FROM information_schema.routines 
                            WHERE routine_schema = 'public' 
                            AND routine_name = '{objectName}'
                            AND has_function_privilege(current_user, routine_schema || '.' || routine_name, 'execute')";
                    break;

                case DatabasePermission.ALTER:
                    // Test ability to alter objects (using a temporary view for safety)
                    sql = "CREATE OR REPLACE TEMP VIEW temp_view_test AS SELECT 1 AS num; ALTER VIEW temp_view_test RENAME TO temp_view_test_2; DROP VIEW temp_view_test_2;";
                    break;

                case DatabasePermission.REFERENCES:
                    // Check if user has reference permission on any table
                    sql = "SELECT 1 WHERE has_table_privilege(current_user, 'information_schema.tables', 'REFERENCES')";
                    break;

                case DatabasePermission.TRIGGER:
                    // Check trigger permission
                    sql = "SELECT 1 WHERE has_table_privilege(current_user, 'information_schema.tables', 'TRIGGER')";
                    break;

                case DatabasePermission.USAGE:
                    // Check usage permission (for schemas)
                    sql = "SELECT 1 WHERE has_schema_privilege(current_user, 'public', 'USAGE')";
                    break;

                case DatabasePermission.CONNECT:
                    // Already connected if we're running this query
                    sql = "SELECT 1";
                    break;

                case DatabasePermission.TEMPORARY:
                    // Test ability to create temporary tables
                    sql = "CREATE TEMP TABLE temp_permission_test (id int); DROP TABLE temp_permission_test;";
                    break;

                case DatabasePermission.TRUNCATE:
                    if (string.IsNullOrEmpty(objectName))
                    {
                        return (false, "Table name is required for TRUNCATE permission test");
                    }
                    // Check if can truncate (without actually doing it)
                    sql = $"DO $$ BEGIN EXECUTE 'EXPLAIN TRUNCATE TABLE {objectName}'; EXCEPTION WHEN insufficient_privilege THEN RAISE EXCEPTION ''no permission''; END $$;";
                    break;

                case DatabasePermission.ALL:
                    // For ALL, we'll just test a basic permission
                    sql = "SELECT 1 FROM information_schema.tables LIMIT 1;";
                    break;

                default:
                    return (false, $"Unsupported permission type: {permission}");
            }

            var decryptedPassword = _encryptionService.Decrypt(user.EncryptedPassword);
            var result = await ExecuteSqlAsync(connection, sql, null, user.Username, decryptedPassword);
            return (result.Success, result.ErrorMessage);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }
}