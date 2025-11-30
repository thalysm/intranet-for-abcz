using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaSede.Application.DTOs.Events;
using NaSede.Application.Interfaces;
using NaSede.Domain.Entities;
using NaSede.Infrastructure.Data;
using System.Security.Claims;

namespace NaSede.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITwilioService _twilioService;
    private readonly IAuthService _authService;
    private readonly IAIService _aiService;
    private readonly IConfiguration _configuration;

    public EventsController(
        ApplicationDbContext context, 
        ITwilioService twilioService,
        IAuthService authService,
        IAIService aiService,
        IConfiguration configuration)
    {
        _context = context;
        _twilioService = twilioService;
        _authService = authService;
        _aiService = aiService;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<ActionResult<List<EventDto>>> GetEvents()
    {
        var events = await _context.Events
            .Include(e => e.CreatedBy)
            .Include(e => e.Confirmations)
                .ThenInclude(c => c.User)
            .OrderByDescending(e => e.EventDate)
            .Select(e => new EventDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                EventDate = e.EventDate,
                Location = e.Location,
                CreatedAt = e.CreatedAt,
                CreatedByUserId = e.CreatedByUserId,
                CreatedByName = e.CreatedBy!.Name,
                Confirmations = e.Confirmations.Select(c => new EventConfirmationDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    UserName = c.User!.Name,
                    Status = (int)c.Status,
                    ResponseDate = c.ResponseDate
                }).ToList()
            })
            .ToListAsync();

        return Ok(events);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EventDto>> GetEvent(Guid id)
    {
        var eventEntity = await _context.Events
            .Include(e => e.CreatedBy)
            .Include(e => e.Confirmations)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (eventEntity == null)
            return NotFound();

        var dto = new EventDto
        {
            Id = eventEntity.Id,
            Title = eventEntity.Title,
            Description = eventEntity.Description,
            EventDate = eventEntity.EventDate,
            Location = eventEntity.Location,
            CreatedAt = eventEntity.CreatedAt,
            CreatedByUserId = eventEntity.CreatedByUserId,
            CreatedByName = eventEntity.CreatedBy!.Name,
            Confirmations = eventEntity.Confirmations.Select(c => new EventConfirmationDto
            {
                Id = c.Id,
                UserId = c.UserId,
                UserName = c.User!.Name,
                Status = (int)c.Status,
                ResponseDate = c.ResponseDate
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EventDto>> CreateEvent([FromBody] CreateEventRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var eventEntity = new Event
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            EventDate = request.EventDate.ToUniversalTime(),
            Location = request.Location,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Events.Add(eventEntity);
        await _context.SaveChangesAsync();

        // Get users to notify
        var usersToNotify = request.NotifyAll
            ? await _context.Users.Where(u => u.WhatsAppNumber != null).ToListAsync()
            : await _context.Users.Where(u => request.NotifyUserIds.Contains(u.Id) && u.WhatsAppNumber != null).ToListAsync();

        // Send WhatsApp notifications
        var frontendUrl = _configuration["Frontend:Url"] ?? "http://localhost:4200";
        
        foreach (var user in usersToNotify)
        {
            var confirmToken = await _authService.GenerateWhatsAppTokenAsync(user.Id);
            var declineToken = await _authService.GenerateWhatsAppTokenAsync(user.Id);

            var confirmLink = $"{frontendUrl}/events/confirm/{eventEntity.Id}?token={confirmToken}";
            var declineLink = $"{frontendUrl}/events/decline/{eventEntity.Id}?token={declineToken}";

            // Convert event date to user's timezone
            var userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(user.TimeZone);
            var eventDateInUserTimeZone = TimeZoneInfo.ConvertTimeFromUtc(eventEntity.EventDate, userTimeZone);

            await _twilioService.SendEventNotificationAsync(
                user.WhatsAppNumber!,
                eventEntity.Title,
                eventDateInUserTimeZone,
                confirmLink,
                declineLink
            );

            // Create notification record
            _context.EventNotifications.Add(new EventNotification
            {
                Id = Guid.NewGuid(),
                EventId = eventEntity.Id,
                UserId = user.Id,
                Sent = true,
                SentAt = DateTime.UtcNow
            });

            // Create pending confirmation
            _context.EventConfirmations.Add(new EventConfirmation
            {
                Id = Guid.NewGuid(),
                EventId = eventEntity.Id,
                UserId = user.Id,
                Status = ConfirmationStatus.Pending,
                ResponseDate = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        var createdEvent = await _context.Events
            .Include(e => e.CreatedBy)
            .FirstAsync(e => e.Id == eventEntity.Id);

        return CreatedAtAction(nameof(GetEvent), new { id = eventEntity.Id }, new EventDto
        {
            Id = createdEvent.Id,
            Title = createdEvent.Title,
            Description = createdEvent.Description,
            EventDate = createdEvent.EventDate,
            Location = createdEvent.Location,
            CreatedAt = createdEvent.CreatedAt,
            CreatedByUserId = createdEvent.CreatedByUserId,
            CreatedByName = createdEvent.CreatedBy!.Name
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EventDto>> UpdateEvent(Guid id, [FromBody] UpdateEventRequest request)
    {
        var eventEntity = await _context.Events.FindAsync(id);

        if (eventEntity == null)
            return NotFound();

        eventEntity.Title = request.Title;
        eventEntity.Description = request.Description;
        eventEntity.EventDate = request.EventDate.ToUniversalTime();
        eventEntity.Location = request.Location;

        await _context.SaveChangesAsync();

        var updatedEvent = await _context.Events
            .Include(e => e.CreatedBy)
            .FirstAsync(e => e.Id == id);

        return Ok(new EventDto
        {
            Id = updatedEvent.Id,
            Title = updatedEvent.Title,
            Description = updatedEvent.Description,
            EventDate = updatedEvent.EventDate,
            Location = updatedEvent.Location,
            CreatedAt = updatedEvent.CreatedAt,
            CreatedByUserId = updatedEvent.CreatedByUserId,
            CreatedByName = updatedEvent.CreatedBy!.Name
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        var eventEntity = await _context.Events.FindAsync(id);

        if (eventEntity == null)
            return NotFound();

        _context.Events.Remove(eventEntity);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{id}/report")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EventReportDto>> GetEventReport(Guid id)
    {
        var eventEntity = await _context.Events
            .Include(e => e.Confirmations)
                .ThenInclude(c => c.User)
            .Include(e => e.Notifications)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (eventEntity == null)
            return NotFound();

        var report = new EventReportDto
        {
            TotalSent = eventEntity.Notifications.Count(n => n.Sent),
            Confirmed = eventEntity.Confirmations.Count(c => c.Status == ConfirmationStatus.Confirmed),
            Declined = eventEntity.Confirmations.Count(c => c.Status == ConfirmationStatus.Declined),
            Pending = eventEntity.Confirmations.Count(c => c.Status == ConfirmationStatus.Pending),
            Details = eventEntity.Confirmations.Select(c => new EventConfirmationDto
            {
                Id = c.Id,
                UserId = c.UserId,
                UserName = c.User!.Name,
                Status = (int)c.Status,
                ResponseDate = c.ResponseDate
            }).ToList()
        };

        return Ok(report);
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> ConfirmEvent(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var confirmation = await _context.EventConfirmations
            .FirstOrDefaultAsync(c => c.EventId == id && c.UserId == userId);

        if (confirmation == null)
        {
            confirmation = new EventConfirmation
            {
                Id = Guid.NewGuid(),
                EventId = id,
                UserId = userId,
                Status = ConfirmationStatus.Confirmed,
                ResponseDate = DateTime.UtcNow
            };
            _context.EventConfirmations.Add(confirmation);
        }
        else
        {
            confirmation.Status = ConfirmationStatus.Confirmed;
            confirmation.ResponseDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Presença confirmada com sucesso!" });
    }

    [HttpPost("{id}/decline")]
    public async Task<IActionResult> DeclineEvent(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var confirmation = await _context.EventConfirmations
            .FirstOrDefaultAsync(c => c.EventId == id && c.UserId == userId);

        if (confirmation == null)
        {
            confirmation = new EventConfirmation
            {
                Id = Guid.NewGuid(),
                EventId = id,
                UserId = userId,
                Status = ConfirmationStatus.Declined,
                ResponseDate = DateTime.UtcNow
            };
            _context.EventConfirmations.Add(confirmation);
        }
        else
        {
            confirmation.Status = ConfirmationStatus.Declined;
            confirmation.ResponseDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Resposta registrada com sucesso!" });
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<UserSelectionDto>>> GetUsersForSelection()
    {
        var users = await _context.Users
            .Where(u => u.WhatsAppNumber != null)
            .Select(u => new UserSelectionDto
            {
                Id = u.Id,
                Name = u.Name,
                Matricula = u.Matricula,
                WhatsAppNumber = u.WhatsAppNumber!
            })
            .OrderBy(u => u.Name)
            .ToListAsync();

        return Ok(users);
    }
    [HttpPost("generate")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CreateEventRequest>> GenerateEvent([FromBody] GenerateEventRequest request)
    {
        var eventDetails = await _aiService.GenerateEventDetailsAsync(request.Prompt);
        return Ok(eventDetails);
    }
}

public class UserSelectionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Matricula { get; set; } = string.Empty;
    public string WhatsAppNumber { get; set; } = string.Empty;
}

public class GenerateEventRequest
{
    public string Prompt { get; set; } = string.Empty;
}
