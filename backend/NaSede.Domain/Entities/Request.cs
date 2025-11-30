namespace NaSede.Domain.Entities;

public enum RequestStatus
{
    Criado = 0,
    EmAndamento = 1,
    Aprovado = 2,
    Reprovado = 3
}

public class Request
{
    public Guid Id { get; set; }
    public Guid TypeId { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Criado;
    public Guid UserId { get; set; }
    public string? Response { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public RequestType? Type { get; set; }
    public User? User { get; set; }
}