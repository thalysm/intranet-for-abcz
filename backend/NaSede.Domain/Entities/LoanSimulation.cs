namespace NaSede.Domain.Entities;

public class LoanSimulation
{
    public Guid Id { get; set; }
    public long Wage { get; set; } // Salário em centavos
    public long LoanAmount { get; set; } // Valor do empréstimo em centavos
    public int NumberInstallments { get; set; } // Número de parcelas
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid UserId { get; set; }
    
    // Navigation properties
    public User? User { get; set; }
    
    // Calculated properties
    public decimal WageInReais => Wage / 100.0m;
    public decimal LoanAmountInReais => LoanAmount / 100.0m;
    public decimal InterestRate => 0.015m; // 1.5%
    public decimal InstallmentValue => CalculateInstallmentValue();
    public decimal TotalAmount => InstallmentValue * NumberInstallments;
    public decimal MaxAllowedLoan => CalculateMaxAllowedLoan();
    public bool IsValidLoan => InstallmentValue <= (WageInReais * 0.4m);
    
    private decimal CalculateInstallmentValue()
    {
        var monthlyInterest = InterestRate;
        var principal = LoanAmountInReais;
        var installments = NumberInstallments;
        
        // Fórmula de juros compostos: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
        var factor = Math.Pow((double)(1 + monthlyInterest), installments);
        return principal * (monthlyInterest * (decimal)factor) / ((decimal)factor - 1);
    }
    
    private decimal CalculateMaxAllowedLoan()
    {
        var maxInstallment = WageInReais * 0.4m; // 40% do salário
        var monthlyInterest = InterestRate;
        var installments = NumberInstallments;
        
        // Fórmula inversa para calcular o principal máximo
        var factor = Math.Pow((double)(1 + monthlyInterest), installments);
        return maxInstallment * ((decimal)factor - 1) / (monthlyInterest * (decimal)factor);
    }
}