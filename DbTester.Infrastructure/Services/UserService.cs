using DbTester.Application.Authentication;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace DbTester.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly Dictionary<string, User> _users = new();
    private readonly Dictionary<string, string> _passwordHashes = new();
    private readonly Dictionary<string, string> _userIdByUsername = new();

    public UserService()
    {
        // Add a default admin account for development
        var adminId = Guid.NewGuid().ToString();
        var admin = new User
        {
            Id = adminId,
            Username = "admin",
            Email = "admin@example.com",
            FirstName = "Admin",
            LastName = "User",
            Role = "Admin"
        };

        _users.Add(adminId, admin);
        _userIdByUsername.Add("admin", adminId);
        _passwordHashes.Add(adminId, HashPassword("admin123"));
    }

    public async Task<User?> ValidateUserCredentials(string username, string password)
    {
        // Simulate async operation
        await Task.CompletedTask;

        if (!_userIdByUsername.TryGetValue(username, out var userId))
            return null;

        if (!_passwordHashes.TryGetValue(userId, out var storedHash))
            return null;

        if (VerifyPassword(password, storedHash))
            return _users[userId];

        return null;
    }

    public async Task<User?> GetUserByUsername(string username)
    {
        // Simulate async operation
        await Task.CompletedTask;

        if (!_userIdByUsername.TryGetValue(username, out var userId))
            return null;

        return _users.TryGetValue(userId, out var user) ? user : null;
    }

    public async Task<User?> GetUserById(string id)
    {
        // Simulate async operation
        await Task.CompletedTask;

        return _users.TryGetValue(id, out var user) ? user : null;
    }

    public async Task<User> CreateUser(User user, string password)
    {
        // Simulate async operation
        await Task.CompletedTask;

        var id = Guid.NewGuid().ToString();
        user.Id = id;

        _users[id] = user;
        _userIdByUsername[user.Username] = id;
        _passwordHashes[id] = HashPassword(password);

        return user;
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var salt = GenerateSalt();
        var passwordWithSalt = password + salt;
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(passwordWithSalt));

        return Convert.ToBase64String(hashedBytes) + ":" + salt;
    }

    private bool VerifyPassword(string password, string storedHash)
    {
        var hashParts = storedHash.Split(':');
        if (hashParts.Length != 2)
            return false;

        var salt = hashParts[1];
        var passwordWithSalt = password + salt;

        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(passwordWithSalt));
        var computedHash = Convert.ToBase64String(hashedBytes);

        return computedHash == hashParts[0];
    }

    private string GenerateSalt()
    {
        var saltBytes = new byte[16];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(saltBytes);
        return Convert.ToBase64String(saltBytes);
    }
}
