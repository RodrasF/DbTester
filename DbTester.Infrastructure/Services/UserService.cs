using DbTester.Application.Authentication;
using DbTester.Application.Interfaces;
using DbTester.Domain.Entities;
using DbTester.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace DbTester.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _dbContext;

    public UserService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<User?> GetUserByUsername(string username)
    {
        var user = await _dbContext.Set<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
            return null;

        return new User
        {
            Id = user.Id.ToString(),
            Username = user.Username,
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task<User?> GetUserById(string id)
    {
        if (!Guid.TryParse(id, out var userId))
            return null;

        var user = await _dbContext.Set<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return null;

        return new User
        {
            Id = user.Id.ToString(),
            Username = user.Username,
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task<User?> ValidateUserCredentials(string username, string password)
    {
        var user = await _dbContext.Set<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
            return null;

        // Verify the password hash
        if (!VerifyPasswordHash(password, user.PasswordHash))
            return null;

        return new User
        {
            Id = user.Id.ToString(),
            Username = user.Username,
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task<User> CreateUser(User user, string password)
    {
        var applicationUser = new ApplicationUser
        {
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            PasswordHash = CreatePasswordHash(password)
        };

        await _dbContext.Set<ApplicationUser>().AddAsync(applicationUser);
        await _dbContext.SaveChangesAsync();

        user.Id = applicationUser.Id.ToString();
        return user;
    }

    private static string CreatePasswordHash(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    private static bool VerifyPasswordHash(string password, string storedHash)
    {
        var hashedPassword = CreatePasswordHash(password);
        return hashedPassword == storedHash;
    }
}
