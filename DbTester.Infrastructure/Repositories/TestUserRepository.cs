using DbTester.Application.Interfaces;
using DbTester.Domain.Entities;
using DbTester.Infrastructure.Data;

namespace DbTester.Infrastructure.Repositories;

public class TestUserRepository : EfGenericRepository<TestUser>, ITestUserRepository
{
    private readonly IDatabaseService _databaseService;

    public TestUserRepository(ApplicationDbContext dbContext, IDatabaseService databaseService)
        : base(dbContext)
    {
        _databaseService = databaseService;
    }

    public async Task<bool> VerifyUserExistsInDatabaseAsync(TestUser user, DatabaseConnection connection)
    {
        // Use the database service to verify if the user exists in the actual database
        // This will depend on the implementation of your database service
        var (success, _, _) = await _databaseService.ExecuteSqlAsync(
            connection,
            "SELECT 1 FROM pg_roles WHERE rolname = @username",
            new { username = user.Username });

        return success;
    }
}
