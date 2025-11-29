namespace NaSede.Domain.Entities;

public class Benefit
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? ImageUrl { get; set; }
    public string? ButtonAction { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public Guid CreatedByUserId { get; set; }
    
    // Navigation properties
    public User? CreatedBy { get; set; }
}