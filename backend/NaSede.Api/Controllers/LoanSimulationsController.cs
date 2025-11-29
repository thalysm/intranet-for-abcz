using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaSede.Application.DTOs.LoanSimulations;
using NaSede.Domain.Entities;
using NaSede.Infrastructure.Data;
using System.Security.Claims;

namespace NaSede.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoanSimulationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LoanSimulationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<LoanSimulationDto>>> GetLoanSimulations()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var simulations = await _context.LoanSimulations
            .Include(ls => ls.User)
            .Where(ls => ls.UserId == userId)
            .OrderByDescending(ls => ls.CreatedAt)
            .ToListAsync();

        var result = simulations.Select(ls => new LoanSimulationDto
        {
            Id = ls.Id,
            Wage = ls.WageInReais,
            LoanAmount = ls.LoanAmountInReais,
            NumberInstallments = ls.NumberInstallments,
            InterestRate = ls.InterestRate,
            InstallmentValue = ls.InstallmentValue,
            TotalAmount = ls.TotalAmount,
            MaxAllowedLoan = ls.MaxAllowedLoan,
            IsValidLoan = ls.IsValidLoan,
            CreatedAt = ls.CreatedAt,
            UserId = ls.UserId,
            UserName = ls.User?.Name
        }).ToList();

        return Ok(result);
    }

    [HttpPost("simulate")]
    public async Task<ActionResult<LoanSimulationResultDto>> SimulateLoan([FromBody] CreateLoanSimulationRequest request)
    {
        // Validações
        if (request.NumberInstallments < 1 || request.NumberInstallments > 12)
        {
            return BadRequest("Número de parcelas deve ser entre 1 e 12.");
        }

        if (request.Wage <= 0 || request.LoanAmount <= 0)
        {
            return BadRequest("Salário e valor do empréstimo devem ser maiores que zero.");
        }

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // Cria uma simulação temporária para calcular os valores
        var tempSimulation = new LoanSimulation
        {
            Id = Guid.NewGuid(),
            Wage = (long)(request.Wage * 100), // Converte para centavos
            LoanAmount = (long)(request.LoanAmount * 100), // Converte para centavos
            NumberInstallments = request.NumberInstallments,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        // Salva a simulação no banco
        _context.LoanSimulations.Add(tempSimulation);
        await _context.SaveChangesAsync();

        // Prepara o resultado
        var result = new LoanSimulationResultDto
        {
            RequestedAmount = tempSimulation.LoanAmountInReais,
            InstallmentValue = tempSimulation.InstallmentValue,
            TotalAmount = tempSimulation.TotalAmount,
            InterestRate = tempSimulation.InterestRate,
            NumberInstallments = tempSimulation.NumberInstallments,
            MaxAllowedLoan = tempSimulation.MaxAllowedLoan,
            IsValidLoan = tempSimulation.IsValidLoan
        };

        // Define a mensagem de validação
        if (!tempSimulation.IsValidLoan)
        {
            result.ValidationMessage = $"O valor da parcela (R$ {tempSimulation.InstallmentValue:F2}) excede 40% do seu salário (máximo permitido: R$ {request.Wage * 0.4m:F2}). " +
                                     $"Valor máximo de empréstimo recomendado: R$ {tempSimulation.MaxAllowedLoan:F2}";
        }
        else
        {
            result.ValidationMessage = "Simulação aprovada! O empréstimo está dentro do limite permitido por lei.";
        }

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LoanSimulationDto>> GetLoanSimulationById(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var simulation = await _context.LoanSimulations
            .Include(ls => ls.User)
            .FirstOrDefaultAsync(ls => ls.Id == id && ls.UserId == userId);

        if (simulation == null)
            return NotFound();

        var result = new LoanSimulationDto
        {
            Id = simulation.Id,
            Wage = simulation.WageInReais,
            LoanAmount = simulation.LoanAmountInReais,
            NumberInstallments = simulation.NumberInstallments,
            InterestRate = simulation.InterestRate,
            InstallmentValue = simulation.InstallmentValue,
            TotalAmount = simulation.TotalAmount,
            MaxAllowedLoan = simulation.MaxAllowedLoan,
            IsValidLoan = simulation.IsValidLoan,
            CreatedAt = simulation.CreatedAt,
            UserId = simulation.UserId,
            UserName = simulation.User?.Name
        };

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLoanSimulation(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var simulation = await _context.LoanSimulations
            .FirstOrDefaultAsync(ls => ls.Id == id && ls.UserId == userId);

        if (simulation == null)
            return NotFound();

        _context.LoanSimulations.Remove(simulation);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}