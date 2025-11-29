namespace NaSede.Application.DTOs.Auth;

public class LoginRequest
{
    public string MatriculaOrPhone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Matricula { get; set; } = string.Empty;
    public string? WhatsAppNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string TimeZone { get; set; } = string.Empty;
    public int Role { get; set; }
    public DateTime CreatedAt { get; set; }
}
