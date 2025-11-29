namespace NaSede.Application.DTOs.Events;

public class EventDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string? CreatedByName { get; set; }
    public List<EventConfirmationDto> Confirmations { get; set; } = new();
}

public class CreateEventRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string Location { get; set; } = string.Empty;
    public List<Guid> NotifyUserIds { get; set; } = new();
    public bool NotifyAll { get; set; }
}

public class UpdateEventRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string Location { get; set; } = string.Empty;
}

public class EventConfirmationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int Status { get; set; }
    public DateTime ResponseDate { get; set; }
}

public class EventReportDto
{
    public int TotalSent { get; set; }
    public int Confirmed { get; set; }
    public int Declined { get; set; }
    public int Pending { get; set; }
    public List<EventConfirmationDto> Details { get; set; } = new();
}
