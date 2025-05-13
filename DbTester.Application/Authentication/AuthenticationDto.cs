using DbTester.Application.Common;

namespace DbTester.Application.Authentication;

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse : BaseResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto? User { get; set; }
    public List<string>? ValidationErrors { get; set; }
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class RegisterResponse : BaseResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto? User { get; set; }
    public List<string>? ValidationErrors { get; set; }
}

public class UserResponse : BaseResponse
{
    public UserDto? User { get; set; }
}

public class User
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
