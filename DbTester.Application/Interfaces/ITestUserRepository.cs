using DbTester.Domain.Entities;

namespace DbTester.Application.Interfaces;

public interface ITestUserRepository : IGenericRepository<TestUser>
{
    Task<TestUser?> GetByUsernameAsync(string username);
    Task<bool> ValidateUserAsync(TestUser user, string decryptedPassword);
}