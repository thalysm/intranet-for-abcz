using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaSede.Application.DTOs.AccountStatements;
using NaSede.Domain.Entities;
using NaSede.Infrastructure.Data;
using System.Security.Claims;

namespace NaSede.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountStatementsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AccountStatementsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<AccountStatementDto>>> GetAccountStatements()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var isAdmin = User.IsInRole("Admin");

        var query = _context.AccountStatements
            .Include(a => a.User)
            .AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(a => a.Type == AccountStatementType.Association || a.UserId == userId);
        }

        var statements = await query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AccountStatementDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                FilePath = a.FilePath,
                Type = (int)a.Type,
                UserId = a.UserId,
                UserName = a.User != null ? a.User.Name : null,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(statements);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AccountStatementDto>> GetAccountStatement(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var isAdmin = User.IsInRole("Admin");

        var statement = await _context.AccountStatements
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (statement == null)
            return NotFound();

        if (!isAdmin && statement.Type == AccountStatementType.Individual && statement.UserId != userId)
            return Forbid();

        var dto = new AccountStatementDto
        {
            Id = statement.Id,
            Title = statement.Title,
            Description = statement.Description,
            FilePath = statement.FilePath,
            Type = (int)statement.Type,
            UserId = statement.UserId,
            UserName = statement.User?.Name,
            CreatedAt = statement.CreatedAt
        };

        return Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AccountStatementDto>> CreateAccountStatement([FromBody] CreateAccountStatementRequest request)
    {
        var statement = new AccountStatement
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            FilePath = request.FilePath,
            Type = (AccountStatementType)request.Type,
            UserId = request.UserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.AccountStatements.Add(statement);
        await _context.SaveChangesAsync();

        var created = await _context.AccountStatements
            .Include(a => a.User)
            .FirstAsync(a => a.Id == statement.Id);

        return CreatedAtAction(nameof(GetAccountStatement), new { id = statement.Id }, new AccountStatementDto
        {
            Id = created.Id,
            Title = created.Title,
            Description = created.Description,
            FilePath = created.FilePath,
            Type = (int)created.Type,
            UserId = created.UserId,
            UserName = created.User?.Name,
            CreatedAt = created.CreatedAt
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAccountStatement(Guid id)
    {
        var statement = await _context.AccountStatements.FindAsync(id);

        if (statement == null)
            return NotFound();

        _context.AccountStatements.Remove(statement);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
