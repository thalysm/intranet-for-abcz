using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NaSede.Application.DTOs.Auth;
using NaSede.Application.Interfaces;
using NaSede.Infrastructure.Data;

namespace NaSede.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly Dictionary<string, (Guid UserId, DateTime Expiry)> _whatsappTokens = new();

    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => 
                u.Matricula == request.MatriculaOrPhone || 
                u.WhatsAppNumber == request.MatriculaOrPhone);

        if (user == null)
            return null;

        // Verify password
        if (!VerifyPassword(request.Password, user.PasswordHash))
            return null;

        var token = GenerateJwtToken(user.Id, user.Role.ToString());

        return new LoginResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Matricula = user.Matricula,
                WhatsAppNumber = user.WhatsAppNumber,
                Name = user.Name,
                Email = user.Email,
                TimeZone = user.TimeZone,
                Role = (int)user.Role,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public async Task<LoginResponse?> LoginWithWhatsAppTokenAsync(string token)
    {
        if (!_whatsappTokens.TryGetValue(token, out var tokenData))
            return null;

        if (tokenData.Expiry < DateTime.UtcNow)
        {
            _whatsappTokens.Remove(token);
            return null;
        }

        var user = await _context.Users.FindAsync(tokenData.UserId);
        if (user == null)
            return null;

        _whatsappTokens.Remove(token);

        var jwtToken = GenerateJwtToken(user.Id, user.Role.ToString());

        return new LoginResponse
        {
            Token = jwtToken,
            User = new UserDto
            {
                Id = user.Id,
                Matricula = user.Matricula,
                WhatsAppNumber = user.WhatsAppNumber,
                Name = user.Name,
                Email = user.Email,
                TimeZone = user.TimeZone,
                Role = (int)user.Role,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public Task<string> GenerateWhatsAppTokenAsync(Guid userId)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");

        _whatsappTokens[token] = (userId, DateTime.UtcNow.AddHours(24));

        return Task.FromResult(token);
    }

    public string GenerateJwtToken(Guid userId, string role)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "NaSedeABCZSecretKeyForJWT2024MinimumLength32Characters"));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "NaSede",
            audience: _configuration["Jwt:Audience"] ?? "NaSedeUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private bool VerifyPassword(string password, string passwordHash)
    {
        // Simple hash comparison for demo
        var hash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(password)));
        return hash == passwordHash;
    }
}
