using DbTester.Domain.Common;

namespace DbTester.Domain.Entities;

public class DatabaseConnection : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Server { get; set; } = string.Empty;
    public int Port { get; set; }
    public string DatabaseName { get; set; } = string.Empty;

    // Username and password are stored encrypted
    public string EncryptedUsername { get; set; } = string.Empty;
    public string EncryptedPassword { get; set; } = string.Empty;

    // Connection pooling settings
    public int MaxPoolSize { get; set; } = 100;
    public int MinPoolSize { get; set; } = 1;
    public int ConnectionTimeout { get; set; } = 30;

    // Last connection test
    public bool IsConnectionValid { get; set; }
    public DateTime? LastConnectionTest { get; set; }
}