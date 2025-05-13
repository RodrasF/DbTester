using DbTester.Domain.Entities;

namespace DbTester.Application.Interfaces;

public interface IDatabaseConnectionRepository : IGenericRepository<DatabaseConnection>
{
}