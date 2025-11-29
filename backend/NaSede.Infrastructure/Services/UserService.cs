using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using NaSede.Application.DTOs.Users;
using NaSede.Application.Interfaces;
using NaSede.Domain.Entities;
using NaSede.Infrastructure.Data;

namespace NaSede.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserResponse> CreateUserAsync(CreateUserRequest request)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email || u.Matricula == request.Matricula);

        if (existingUser != null)
        {
            throw new InvalidOperationException("Usuário com este e-mail ou matrícula já existe.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            Matricula = request.Matricula,
            WhatsAppNumber = request.WhatsAppNumber,
            Role = request.Role,
            PasswordHash = HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return MapToResponse(user);
    }

    public async Task<UserResponse?> GetUserByIdAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        return user == null ? null : MapToResponse(user);
    }

    public async Task<UserResponse?> GetUserByEmailAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        return user == null ? null : MapToResponse(user);
    }

    private string HashPassword(string password)
    {
        return Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(password)));
    }

    private static UserResponse MapToResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Matricula = user.Matricula,
            WhatsAppNumber = user.WhatsAppNumber,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }
}
