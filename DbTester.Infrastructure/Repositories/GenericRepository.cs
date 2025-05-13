using System.Data;
using Dapper;
using DbTester.Application.Interfaces;
using DbTester.Domain.Common;
using DbTester.Infrastructure.Data;

namespace DbTester.Infrastructure.Repositories;

public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
{
    protected readonly DbConnectionFactory _connectionFactory;
    protected readonly string _tableName;

    public GenericRepository(DbConnectionFactory connectionFactory, string tableName)
    {
        _connectionFactory = connectionFactory;
        _tableName = tableName;
    }

    public virtual async Task<T?> GetByIdAsync(Guid id)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = $"SELECT * FROM {_tableName} WHERE Id = @Id";
        return await connection.QuerySingleOrDefaultAsync<T>(sql, new { Id = id });
    }

    public virtual async Task<IReadOnlyList<T>> GetAllAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = $"SELECT * FROM {_tableName}";
        var result = await connection.QueryAsync<T>(sql);
        return result.ToList();
    }

    public virtual async Task<T> AddAsync(T entity)
    {
        using var connection = _connectionFactory.CreateConnection();

        // Set created timestamp
        entity.CreatedAt = DateTime.UtcNow;

        // Get all properties except Id (which should be auto-generated)
        var properties = typeof(T).GetProperties()
            .Where(p => p.Name != "Id" && p.CanWrite)
            .ToList();

        var columnNames = string.Join(", ", properties.Select(p => p.Name));
        var paramNames = string.Join(", ", properties.Select(p => "@" + p.Name));

        var sql = $@"
            INSERT INTO {_tableName} ({columnNames}) 
            VALUES ({paramNames})
            RETURNING *";

        return await connection.QuerySingleAsync<T>(sql, entity);
    }

    public virtual async Task UpdateAsync(T entity)
    {
        using var connection = _connectionFactory.CreateConnection();

        // Update modified timestamp
        entity.ModifiedAt = DateTime.UtcNow;

        // Get all properties except Id and CreatedAt
        var properties = typeof(T).GetProperties()
            .Where(p => p.Name != "Id" && p.Name != "CreatedAt" && p.CanWrite)
            .ToList();

        var updateSet = string.Join(", ", properties.Select(p => $"{p.Name} = @{p.Name}"));

        var sql = $@"
            UPDATE {_tableName} 
            SET {updateSet}
            WHERE Id = @Id";

        await connection.ExecuteAsync(sql, entity);
    }

    public virtual async Task DeleteAsync(T entity)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = $"DELETE FROM {_tableName} WHERE Id = @Id";
        await connection.ExecuteAsync(sql, new { entity.Id });
    }
}