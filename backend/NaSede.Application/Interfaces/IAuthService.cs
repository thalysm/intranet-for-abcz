using NaSede.Application.DTOs.Auth;

namespace NaSede.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<LoginResponse?> LoginWithWhatsAppTokenAsync(string token);
    Task<string> GenerateWhatsAppTokenAsync(Guid userId);
    string GenerateJwtToken(Guid userId, string role);
}
