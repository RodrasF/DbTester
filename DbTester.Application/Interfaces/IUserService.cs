using DbTester.Application.Authentication;

namespace DbTester.Application.Interfaces;

public interface IUserService
{
    Task<User?> ValidateUserCredentials(string username, string password);
    Task<User?> GetUserByUsername(string username);
    Task<User?> GetUserById(string id);
    Task<User> CreateUser(User user, string password);
}
