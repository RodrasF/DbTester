using DbTester.Application.Common;

namespace DbTester.Application.ConnectionManagement;

public class DatabaseConnectionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Server { get; set; } = string.Empty;
    public int Port { get; set; } = 5432; // Default PostgreSQL port
    public string DatabaseName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public int MaxPoolSize { get; set; } = 100;
    public int MinPoolSize { get; set; } = 1;
    public int ConnectionTimeout { get; set; } = 30;
    public bool IsConnectionValid { get; set; }
    public DateTime? LastConnectionTest { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ModifiedAt { get; set; }
}

public class CreateDatabaseConnectionRequest
{
    public string Name { get; set; } = string.Empty;
    public string Server { get; set; } = string.Empty;
    public int Port { get; set; } = 5432; // Default PostgreSQL port
    public string DatabaseName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public int MaxPoolSize { get; set; } = 100;
    public int MinPoolSize { get; set; } = 1;
    public int ConnectionTimeout { get; set; } = 30;
}

public class UpdateDatabaseConnectionRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Server { get; set; } = string.Empty;
    public int Port { get; set; } = 5432;
    public string DatabaseName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // Leave empty to keep the existing password
    public int MaxPoolSize { get; set; } = 100;
    public int MinPoolSize { get; set; } = 1;
    public int ConnectionTimeout { get; set; } = 30;
}

public class DatabaseConnectionResponse : BaseResponse
{
    public DatabaseConnectionDto? Connection { get; set; }
}

public class DatabaseConnectionListResponse : BaseResponse
{
    public List<DatabaseConnectionDto> Connections { get; set; } = new List<DatabaseConnectionDto>();
}

public class TestConnectionRequest
{
    public Guid? Id { get; set; } // If testing an existing connection
    public string? Server { get; set; }
    public int Port { get; set; } = 5432;
    public string? DatabaseName { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
}

public class TestConnectionResponse : BaseResponse
{
    public bool IsConnectionValid { get; set; }
}