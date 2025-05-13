using DbTester.Domain.Entities;

namespace DbTester.Application.Interfaces;

public interface IDatabaseConnectionRepository : IGenericRepository<DatabaseConnection>
{
    Task<bool> TestConnectionAsync(DatabaseConnection connection);
    Task<IReadOnlyList<DatabaseConnection>> GetConnectionsByNameAsync(string name);
}