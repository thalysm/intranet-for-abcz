using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NaSede.Application.DTOs.Auth;
using NaSede.Application.Interfaces;
using NaSede.Domain.Entities;
using NaSede.Infrastructure.Data;

namespace NaSede.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

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
        var tokenEntity = await _context.WhatsAppTokens
            .FirstOrDefaultAsync(t => t.Token == token);

        if (tokenEntity == null)
            return null;

        if (tokenEntity.Expiry < DateTime.UtcNow)
        {
            _context.WhatsAppTokens.Remove(tokenEntity);
            await _context.SaveChangesAsync();
            return null;
        }

        var user = await _context.Users.FindAsync(tokenEntity.UserId);
        if (user == null)
            return null;

        // Optional: Remove token after use if it's one-time use. 
        // If we want it to be reusable within the window, keep it.
        // Assuming one-time use for security, but user asked for 7 days validity which might imply reusability?
        // Usually "confirm/decline" links are clicked once. 
        // However, if they click again to change their mind, it should work.
        // Let's NOT remove it immediately, or maybe remove only if it was intended as a one-time login.
        // But this is "LoginWithWhatsAppToken".
        // If I remove it, they can't click the link again.
        // Let's keep it valid until expiry.
        
        // Actually, for security, login tokens are usually one-time. 
        // But for "confirm/decline" links that also log you in, it's annoying if you click, close, and click again and it fails.
        // Let's keep it.

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

    public async Task<string> GenerateWhatsAppTokenAsync(Guid userId)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");

        var tokenEntity = new WhatsAppToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            UserId = userId,
            Expiry = DateTime.UtcNow.AddDays(7), // 7 days validity
            CreatedAt = DateTime.UtcNow
        };

        _context.WhatsAppTokens.Add(tokenEntity);
        await _context.SaveChangesAsync();

        return token;
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
