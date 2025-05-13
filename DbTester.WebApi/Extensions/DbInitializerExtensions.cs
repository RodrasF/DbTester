using DbTester.Infrastructure.Data;

namespace Microsoft.Extensions.DependencyInjection;

public static class DbInitializerExtensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        await app.Services.GetRequiredService<DbInitializer>()
            .InitializeAsync();
    }
}
