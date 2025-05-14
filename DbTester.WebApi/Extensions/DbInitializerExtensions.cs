using DbTester.Infrastructure.Data;

namespace Microsoft.Extensions.DependencyInjection;

public static class DbInitializerExtensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<DbInitializer>()
            .InitializeAsync();
    }
}
