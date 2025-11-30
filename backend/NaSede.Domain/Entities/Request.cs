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
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Response { get; set; }
    public Guid? SimulationId { get; set; } // ID da simulação específica para empréstimos
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public RequestType? Type { get; set; }
    public User? User { get; set; }
    public LoanSimulation? LoanSimulation { get; set; } // Relação com a simulação específica
}