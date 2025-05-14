using DbTester.Application.Interfaces;
using DbTester.Domain.Entities;
using DbTester.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DbTester.Infrastructure.Repositories;

public class TestUserRepository : EfGenericRepository<TestUser>, ITestUserRepository
{
    private readonly IDatabaseService _databaseService;

    public TestUserRepository(ApplicationDbContext dbContext, IDatabaseService databaseService)
        : base(dbContext)
    {
        _databaseService = databaseService;
    }

    // Override the base methods to include the required Connection property
    public override async Task<TestUser?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(u => u.Connection)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public override async Task<IReadOnlyList<TestUser>> GetAllAsync()
    {
        return await _dbSet
            .Include(u => u.Connection)
            .ToListAsync();
    }

    public async Task<TestUser?> GetByUsernameAsync(string username)
    {
        return await _dbSet
            .Include(u => u.Connection)
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<bool> ValidateUserAsync(TestUser user, string decryptedPassword)
    {
        var isValid = await _databaseService.TestConnectionAsync(user.Connection!, user.Username, decryptedPassword);

        user.IsValid = isValid;
        await UpdateAsync(user);

        return isValid;
    }
}
