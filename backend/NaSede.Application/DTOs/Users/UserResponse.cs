using NaSede.Domain.Entities;

namespace NaSede.Application.DTOs.Users;

public class UserResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Matricula { get; set; } = string.Empty;
    public string? WhatsAppNumber { get; set; }
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
}
