using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaSede.Application.DTOs.Benefits;
using NaSede.Domain.Entities;
using NaSede.Infrastructure.Data;
using System.Security.Claims;

namespace NaSede.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BenefitsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BenefitsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<BenefitDto>>> GetBenefits()
    {
        var isAdmin = User.IsInRole("Admin");
        
        var query = _context.Benefits
            .Include(b => b.CreatedBy)
            .AsQueryable();

        // Se não for admin, mostra apenas benefícios ativos
        if (!isAdmin)
        {
            query = query.Where(b => b.IsActive);
        }

        var benefits = await query
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BenefitDto
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                IsActive = b.IsActive,
                ImageUrl = b.ImageUrl,
                ButtonAction = b.ButtonAction,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt,
                CreatedByUserId = b.CreatedByUserId,
                CreatedByName = b.CreatedBy!.Name
            })
            .ToListAsync();

        return Ok(benefits);
    }

    [HttpGet("cards")]
    public async Task<ActionResult<List<BenefitCardDto>>> GetBenefitCards()
    {
        var benefits = await _context.Benefits
            .Where(b => b.IsActive)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BenefitCardDto
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                ImageUrl = b.ImageUrl,
                ButtonAction = b.ButtonAction
            })
            .ToListAsync();

        return Ok(benefits);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BenefitDto>> GetBenefitById(Guid id)
    {
        var benefit = await _context.Benefits
            .Include(b => b.CreatedBy)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (benefit == null)
            return NotFound();

        var isAdmin = User.IsInRole("Admin");
        
        // Se não for admin e o benefício não estiver ativo, não permite acesso
        if (!isAdmin && !benefit.IsActive)
            return NotFound();

        var dto = new BenefitDto
        {
            Id = benefit.Id,
            Name = benefit.Name,
            Description = benefit.Description,
            IsActive = benefit.IsActive,
            ImageUrl = benefit.ImageUrl,
            ButtonAction = benefit.ButtonAction,
            CreatedAt = benefit.CreatedAt,
            UpdatedAt = benefit.UpdatedAt,
            CreatedByUserId = benefit.CreatedByUserId,
            CreatedByName = benefit.CreatedBy!.Name
        };

        return Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BenefitDto>> CreateBenefit([FromBody] CreateBenefitRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var benefit = new Benefit
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive,
            ImageUrl = request.ImageUrl,
            ButtonAction = request.ButtonAction,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Benefits.Add(benefit);
        await _context.SaveChangesAsync();

        var createdBenefit = await _context.Benefits
            .Include(b => b.CreatedBy)
            .FirstAsync(b => b.Id == benefit.Id);

        return CreatedAtAction(nameof(GetBenefitById), new { id = benefit.Id }, new BenefitDto
        {
            Id = createdBenefit.Id,
            Name = createdBenefit.Name,
            Description = createdBenefit.Description,
            IsActive = createdBenefit.IsActive,
            ImageUrl = createdBenefit.ImageUrl,
            ButtonAction = createdBenefit.ButtonAction,
            CreatedAt = createdBenefit.CreatedAt,
            UpdatedAt = createdBenefit.UpdatedAt,
            CreatedByUserId = createdBenefit.CreatedByUserId,
            CreatedByName = createdBenefit.CreatedBy!.Name
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BenefitDto>> UpdateBenefit(Guid id, [FromBody] UpdateBenefitRequest request)
    {
        var benefit = await _context.Benefits.FindAsync(id);

        if (benefit == null)
            return NotFound();

        benefit.Name = request.Name;
        benefit.Description = request.Description;
        benefit.IsActive = request.IsActive;
        benefit.ImageUrl = request.ImageUrl;
        benefit.ButtonAction = request.ButtonAction;
        benefit.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var updatedBenefit = await _context.Benefits
            .Include(b => b.CreatedBy)
            .FirstAsync(b => b.Id == id);

        return Ok(new BenefitDto
        {
            Id = updatedBenefit.Id,
            Name = updatedBenefit.Name,
            Description = updatedBenefit.Description,
            IsActive = updatedBenefit.IsActive,
            ImageUrl = updatedBenefit.ImageUrl,
            ButtonAction = updatedBenefit.ButtonAction,
            CreatedAt = updatedBenefit.CreatedAt,
            UpdatedAt = updatedBenefit.UpdatedAt,
            CreatedByUserId = updatedBenefit.CreatedByUserId,
            CreatedByName = updatedBenefit.CreatedBy!.Name
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBenefit(Guid id)
    {
        var benefit = await _context.Benefits.FindAsync(id);

        if (benefit == null)
            return NotFound();

        _context.Benefits.Remove(benefit);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}