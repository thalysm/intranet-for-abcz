namespace NaSede.Domain.Entities;

public class News
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public Guid CreatedByUserId { get; set; }
    
    // Navigation properties
    public User? CreatedBy { get; set; }
    public ICollection<NewsComment> Comments { get; set; } = new List<NewsComment>();
}

public class NewsComment
{
    public Guid Id { get; set; }
    public Guid NewsId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public News? News { get; set; }
    public User? User { get; set; }
}
