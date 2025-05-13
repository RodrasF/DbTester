using DbTester.Application.Interfaces;
using DbTester.Domain.Entities;
using DbTester.Infrastructure.Data;

namespace DbTester.Infrastructure.Repositories;

public class DatabaseConnectionRepository : EfGenericRepository<DatabaseConnection>, IDatabaseConnectionRepository
{
    private readonly IDatabaseService _databaseService;

    public DatabaseConnectionRepository(ApplicationDbContext dbContext, IDatabaseService databaseService)
        : base(dbContext)
    {
        _databaseService = databaseService;
    }
}
