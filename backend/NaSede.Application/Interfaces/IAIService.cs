using NaSede.Application.DTOs.Events;

namespace NaSede.Application.Interfaces;

public interface IAIService
{
    Task<CreateEventRequest> GenerateEventDetailsAsync(string prompt);
}
