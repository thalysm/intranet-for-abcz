namespace NaSede.Application.DTOs.LoanSimulations;

public class LoanSimulationDto
{
    public Guid Id { get; set; }
    public decimal Wage { get; set; }
    public decimal LoanAmount { get; set; }
    public int NumberInstallments { get; set; }
    public decimal InterestRate { get; set; }
    public decimal InstallmentValue { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal MaxAllowedLoan { get; set; }
    public bool IsValidLoan { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
}

public class CreateLoanSimulationRequest
{
    public decimal Wage { get; set; }
    public decimal LoanAmount { get; set; }
    public int NumberInstallments { get; set; }
}

public class LoanSimulationResultDto
{
    public Guid Id { get; set; } // ID da simulação criada
    public decimal RequestedAmount { get; set; }
    public decimal InstallmentValue { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal InterestRate { get; set; }
    public int NumberInstallments { get; set; }
    public decimal MaxAllowedLoan { get; set; }
    public bool IsValidLoan { get; set; }
    public string ValidationMessage { get; set; } = string.Empty;
}