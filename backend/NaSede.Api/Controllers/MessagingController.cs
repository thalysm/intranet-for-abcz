using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaSede.Application.DTOs.Messaging;
using NaSede.Application.Interfaces;
using NaSede.Infrastructure.Data;

namespace NaSede.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class MessagingController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITwilioService _twilioService;

    public MessagingController(ApplicationDbContext context, ITwilioService twilioService)
    {
        _context = context;
        _twilioService = twilioService;
    }

    [HttpPost("send")]
    public async Task<ActionResult<MessageResponse>> SendMessage([FromBody] SendMessageRequest request)
    {
        var usersToMessage = request.SendToAll
            ? await _context.Users.Where(u => u.WhatsAppNumber != null).ToListAsync()
            : await _context.Users.Where(u => request.UserIds.Contains(u.Id) && u.WhatsAppNumber != null).ToListAsync();

        var response = new MessageResponse
        {
            TotalSent = usersToMessage.Count
        };

        foreach (var user in usersToMessage)
        {
            var success = await _twilioService.SendWhatsAppMessageAsync(user.WhatsAppNumber!, request.Message);
            
            if (success)
            {
                response.SuccessCount++;
            }
            else
            {
                response.FailureCount++;
                response.FailedNumbers.Add(user.WhatsAppNumber!);
            }
        }

        return Ok(response);
    }
}
