namespace NaSede.Domain.Entities;

public class MarketplaceItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public MarketplaceItemType Type { get; set; }
    public string? ImageUrl { get; set; }
    public string ContactInfo { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User? User { get; set; }
}

public enum MarketplaceItemType
{
    Product,
    Service
}
