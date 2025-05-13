using DbTester.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace DbTester.Infrastructure.Data;

public class DbInitializer
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DbInitializer> _logger;

    public DbInitializer(ApplicationDbContext context, ILogger<DbInitializer> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task InitializeAsync()
    {
        try
        {
            // Ensure database is created and migrations are applied
            await _context.Database.MigrateAsync();
            _logger.LogInformation("Database migrated successfully");

            // Seed initial admin user if not exists
            await SeedAdminUserAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initializing the database");
            throw;
        }
    }

    private async Task SeedAdminUserAsync()
    {
        if (!await _context.Set<ApplicationUser>().AnyAsync())
        {
            _logger.LogInformation("Creating admin user");

            var adminUser = new ApplicationUser
            {
                Username = "Admin",
                Email = "admin@dbtester.com",
                Role = "Admin",
                PasswordHash = CreatePasswordHash("Admin123!") // Default password should be changed after first login
            };

            await _context.Set<ApplicationUser>().AddAsync(adminUser);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Admin user created successfully");
        }
    }

    private static string CreatePasswordHash(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}
