namespace NaSede.Application.DTOs.AccountStatements;

public class AccountStatementDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public int Type { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAccountStatementRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public int Type { get; set; }
    public Guid? UserId { get; set; }
}
