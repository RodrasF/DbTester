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
            Username = username ?? _encryptionService.Decrypt(connection.EncryptedUsername),
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
        var decryptedPassword = _encryptionService.Decrypt(user.EncryptedPassword);
        string sql;

        try
        {
            switch (permission)
            {
                case DatabasePermission.CreateTable:
                    sql = "CREATE TABLE temp_permission_test (id int); DROP TABLE temp_permission_test;";
                    break;

                case DatabasePermission.DropTable:
                    sql = "CREATE TABLE temp_permission_test (id int); DROP TABLE temp_permission_test;";
                    break;

                case DatabasePermission.SelectTable:
                    if (string.IsNullOrEmpty(objectName))
                    {
                        return (false, "Table name is required for SELECT permission test");
                    }
                    sql = $"SELECT * FROM {objectName} LIMIT 1";
                    break;

                case DatabasePermission.InsertTable:
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

                case DatabasePermission.UpdateTable:
                    if (string.IsNullOrEmpty(objectName))
                    {
                        return (false, "Table name is required for UPDATE permission test");
                    }
                    sql = $"DO $$ BEGIN EXECUTE 'EXPLAIN UPDATE {objectName} SET dummy = dummy WHERE 1=0'; EXCEPTION WHEN undefined_column THEN NULL; END $$;";
                    break;

                case DatabasePermission.DeleteTable:
                    if (string.IsNullOrEmpty(objectName))
                    {
                        return (false, "Table name is required for DELETE permission test");
                    }
                    sql = $"EXPLAIN DELETE FROM {objectName} WHERE 1=0";
                    break;

                case DatabasePermission.ExecuteStoredProcedure:
                    if (string.IsNullOrEmpty(objectName))
                    {
                        return (false, "Procedure name is required for EXECUTE permission test");
                    }
                    // Just check if the function exists and is executable by the user
                    sql = $@"SELECT 1 FROM information_schema.routines 
                            WHERE routine_schema = 'public' 
                            AND routine_name = '{objectName}'
                            AND has_function_privilege(current_user, routine_schema || '.' || routine_name, 'execute')";
                    break;

                case DatabasePermission.ExecuteFunction:
                    if (string.IsNullOrEmpty(objectName))
                    {
                        return (false, "Function name is required for EXECUTE permission test");
                    }
                    // Same as stored procedure check
                    sql = $@"SELECT 1 FROM information_schema.routines 
                            WHERE routine_schema = 'public' 
                            AND routine_name = '{objectName}'
                            AND has_function_privilege(current_user, routine_schema || '.' || routine_name, 'execute')";
                    break;

                case DatabasePermission.CreateView:
                    sql = "CREATE OR REPLACE TEMP VIEW temp_view_test AS SELECT 1 AS num; DROP VIEW temp_view_test;";
                    break;

                case DatabasePermission.ModifyView:
                    sql = "CREATE OR REPLACE TEMP VIEW temp_view_test AS SELECT 1 AS num; ALTER VIEW temp_view_test RENAME TO temp_view_test_2; DROP VIEW temp_view_test_2;";
                    break;

                case DatabasePermission.CreateIndex:
                    if (string.IsNullOrEmpty(objectName))
                    {
                        return (false, "Table name is required for CREATE INDEX permission test");
                    }
                    sql = $"DO $$ BEGIN EXECUTE 'EXPLAIN CREATE INDEX temp_idx ON {objectName} (id)'; EXCEPTION WHEN undefined_column THEN NULL; END $$;";
                    break;

                case DatabasePermission.GrantPermission:
                    // Check if user has permission to grant any privilege
                    sql = "SELECT 1 WHERE has_any_column_privilege(current_user, 'information_schema.columns', 'GRANT OPTION');";
                    break;

                case DatabasePermission.RevokePermission:
                    // If user can grant, they can also revoke
                    sql = "SELECT 1 WHERE has_any_column_privilege(current_user, 'information_schema.columns', 'GRANT OPTION');";
                    break;

                case DatabasePermission.AccessSystemTables:
                    // Try to access pg_catalog or information_schema
                    sql = "SELECT 1 FROM pg_catalog.pg_tables LIMIT 1";
                    break;

                case DatabasePermission.AccessInformationSchema:
                    sql = "SELECT 1 FROM information_schema.tables LIMIT 1";
                    break;

                default:
                    return (false, $"Unsupported permission type: {permission}");
            }

            var result = await ExecuteSqlAsync(connection, sql, null, user.Username, decryptedPassword);
            return (result.Success, result.ErrorMessage);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    public async Task<bool> CreateUserAsync(DatabaseConnection connection, TestUser user)
    {
        try
        {
            var decryptedPassword = _encryptionService.Decrypt(user.EncryptedPassword);
            string sql;

            if (!string.IsNullOrEmpty(user.AssignedRole))
            {
                // Create user and grant role
                sql = $@"
                    DO $$
                    BEGIN
                        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '{user.Username}') THEN
                            CREATE ROLE ""{user.Username}"" WITH LOGIN PASSWORD '{decryptedPassword}';
                        END IF;
                        
                        GRANT ""{user.AssignedRole}"" TO ""{user.Username}"";
                    EXCEPTION WHEN duplicate_object THEN
                        -- Role already exists
                        RAISE NOTICE 'User already exists';
                    END
                    $$;";
            }
            else
            {
                // Just create the user without role
                sql = $@"
                    DO $$
                    BEGIN
                        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '{user.Username}') THEN
                            CREATE ROLE ""{user.Username}"" WITH LOGIN PASSWORD '{decryptedPassword}';
                        END IF;
                    EXCEPTION WHEN duplicate_object THEN
                        -- Role already exists
                        RAISE NOTICE 'User already exists';
                    END
                    $$;";
            }

            var result = await ExecuteSqlAsync(connection, sql);
            return result.Success;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<bool> DropUserAsync(DatabaseConnection connection, string username)
    {
        try
        {
            var sql = $@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '{username}') THEN
                        DROP ROLE ""{username}"";
                    END IF;
                END
                $$;";

            var result = await ExecuteSqlAsync(connection, sql);
            return result.Success;
        }
        catch (Exception)
        {
            return false;
        }
    }
}