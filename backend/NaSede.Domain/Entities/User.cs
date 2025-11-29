namespace NaSede.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Matricula { get; set; } = string.Empty;
    public string? WhatsAppNumber { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string TimeZone { get; set; } = "America/Sao_Paulo";
    public UserRole Role { get; set; } = UserRole.Associado;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<EventConfirmation> EventConfirmations { get; set; } = new List<EventConfirmation>();
    public ICollection<NewsComment> NewsComments { get; set; } = new List<NewsComment>();
    public ICollection<MarketplaceItem> MarketplaceItems { get; set; } = new List<MarketplaceItem>();
}

public enum UserRole
{
    Associado,
    Admin
}
