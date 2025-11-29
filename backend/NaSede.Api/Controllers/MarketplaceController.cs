using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaSede.Domain.Entities;
using NaSede.Infrastructure.Data;
using System.Security.Claims;

namespace NaSede.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MarketplaceController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MarketplaceController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<MarketplaceItemDto>>> GetItems()
    {
        var items = await _context.MarketplaceItems
            .Include(m => m.User)
            .Where(m => m.IsActive)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new MarketplaceItemDto
            {
                Id = m.Id,
                Title = m.Title,
                Description = m.Description,
                Price = m.Price,
                Type = (int)m.Type,
                ImageUrl = m.ImageUrl,
                ContactInfo = m.ContactInfo,
                UserId = m.UserId,
                UserName = m.User!.Name,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<MarketplaceItemDto>> CreateItem([FromBody] CreateMarketplaceItemRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var item = new MarketplaceItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Price = request.Price,
            Type = (MarketplaceItemType)request.Type,
            ImageUrl = request.ImageUrl,
            ContactInfo = request.ContactInfo,
            UserId = userId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.MarketplaceItems.Add(item);
        await _context.SaveChangesAsync();

        var created = await _context.MarketplaceItems
            .Include(m => m.User)
            .FirstAsync(m => m.Id == item.Id);

        return Ok(new MarketplaceItemDto
        {
            Id = created.Id,
            Title = created.Title,
            Description = created.Description,
            Price = created.Price,
            Type = (int)created.Type,
            ImageUrl = created.ImageUrl,
            ContactInfo = created.ContactInfo,
            UserId = created.UserId,
            UserName = created.User!.Name,
            CreatedAt = created.CreatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var isAdmin = User.IsInRole("Admin");

        var item = await _context.MarketplaceItems.FindAsync(id);

        if (item == null)
            return NotFound();

        if (item.UserId != userId && !isAdmin)
            return Forbid();

        _context.MarketplaceItems.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class MarketplaceItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Type { get; set; }
    public string? ImageUrl { get; set; }
    public string ContactInfo { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateMarketplaceItemRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Type { get; set; }
    public string? ImageUrl { get; set; }
    public string ContactInfo { get; set; } = string.Empty;
}
