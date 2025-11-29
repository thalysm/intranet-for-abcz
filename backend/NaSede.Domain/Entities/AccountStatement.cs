namespace NaSede.Domain.Entities;

public class AccountStatement
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public AccountStatementType Type { get; set; }
    public Guid? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User? User { get; set; }
}

public enum AccountStatementType
{
    Individual,
    Association
}
