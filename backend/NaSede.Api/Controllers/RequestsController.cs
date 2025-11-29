using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaSede.Application.DTOs.Requests;
using NaSede.Domain.Entities;
using NaSede.Infrastructure.Data;
using System.Security.Claims;

namespace NaSede.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RequestsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RequestsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<RequestDto>>> GetRequests()
    {
        var isAdmin = User.IsInRole("Admin");
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var query = _context.Requests
            .Include(r => r.Type)
            .Include(r => r.User)
            .AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(r => r.UserId == userId);
        }

        var requests = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();

        var result = requests.Select(r => new RequestDto
        {
            Id = r.Id,
            TypeId = r.TypeId,
            TypeName = r.Type?.Name ?? string.Empty,
            Status = (int)r.Status,
            StatusName = GetStatusName(r.Status),
            UserId = r.UserId,
            UserName = r.User?.Name ?? string.Empty,
            Response = r.Response,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RequestDto>> GetRequestById(Guid id)
    {
        var isAdmin = User.IsInRole("Admin");
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var request = await _context.Requests
            .Include(r => r.Type)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
            return NotFound();

        if (!isAdmin && request.UserId != userId)
            return Forbid();

        var result = new RequestDto
        {
            Id = request.Id,
            TypeId = request.TypeId,
            TypeName = request.Type?.Name ?? string.Empty,
            Status = (int)request.Status,
            StatusName = GetStatusName(request.Status),
            UserId = request.UserId,
            UserName = request.User?.Name ?? string.Empty,
            Response = request.Response,
            CreatedAt = request.CreatedAt,
            UpdatedAt = request.UpdatedAt
        };

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<RequestDto>> CreateRequest([FromBody] CreateRequestRequest requestDto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var requestType = await _context.RequestTypes.FindAsync(requestDto.TypeId);
        if (requestType == null)
            return BadRequest("Tipo de solicitação não encontrado.");

        var request = new Request
        {
            Id = Guid.NewGuid(),
            TypeId = requestDto.TypeId,
            UserId = userId,
            Status = RequestStatus.Criado,
            CreatedAt = DateTime.UtcNow
        };

        _context.Requests.Add(request);
        await _context.SaveChangesAsync();

        var result = new RequestDto
        {
            Id = request.Id,
            TypeId = request.TypeId,
            TypeName = requestType.Name,
            Status = (int)request.Status,
            StatusName = GetStatusName(request.Status),
            UserId = request.UserId,
            UserName = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,
            Response = request.Response,
            CreatedAt = request.CreatedAt,
            UpdatedAt = request.UpdatedAt
        };

        return CreatedAtAction(nameof(GetRequestById), new { id = request.Id }, result);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RequestDto>> UpdateRequestStatus(Guid id, [FromBody] UpdateRequestStatusRequest statusDto)
    {
        var request = await _context.Requests
            .Include(r => r.Type)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
            return NotFound();

        if (statusDto.Status == 3 && string.IsNullOrWhiteSpace(statusDto.Response)) // Reprovado
            return BadRequest("Justificativa é obrigatória para reprovar uma solicitação.");

        request.Status = (RequestStatus)statusDto.Status;
        request.Response = statusDto.Response;
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var result = new RequestDto
        {
            Id = request.Id,
            TypeId = request.TypeId,
            TypeName = request.Type?.Name ?? string.Empty,
            Status = (int)request.Status,
            StatusName = GetStatusName(request.Status),
            UserId = request.UserId,
            UserName = request.User?.Name ?? string.Empty,
            Response = request.Response,
            CreatedAt = request.CreatedAt,
            UpdatedAt = request.UpdatedAt
        };

        return Ok(result);
    }

    [HttpGet("types")]
    public async Task<ActionResult<List<RequestTypeDto>>> GetRequestTypes()
    {
        var types = await _context.RequestTypes
            .OrderBy(t => t.Name)
            .ToListAsync();

        var result = types.Select(t => new RequestTypeDto
        {
            Id = t.Id,
            Name = t.Name,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        }).ToList();

        return Ok(result);
    }

    [HttpPost("types")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RequestTypeDto>> CreateRequestType([FromBody] CreateRequestTypeRequest typeDto)
    {
        var existingType = await _context.RequestTypes
            .FirstOrDefaultAsync(t => t.Name.ToLower() == typeDto.Name.ToLower());

        if (existingType != null)
            return BadRequest("Já existe um tipo de solicitação com este nome.");

        var requestType = new RequestType
        {
            Id = Guid.NewGuid(),
            Name = typeDto.Name,
            CreatedAt = DateTime.UtcNow
        };

        _context.RequestTypes.Add(requestType);
        await _context.SaveChangesAsync();

        var result = new RequestTypeDto
        {
            Id = requestType.Id,
            Name = requestType.Name,
            CreatedAt = requestType.CreatedAt,
            UpdatedAt = requestType.UpdatedAt
        };

        return CreatedAtAction(nameof(GetRequestTypes), result);
    }

    private static string GetStatusName(RequestStatus status)
    {
        return status switch
        {
            RequestStatus.Criado => "Criado",
            RequestStatus.EmAndamento => "Em Andamento",
            RequestStatus.Aprovado => "Aprovado",
            RequestStatus.Reprovado => "Reprovado",
            _ => "Desconhecido"
        };
    }
}