namespace NaSede.Domain.Entities;

public class Event
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid CreatedByUserId { get; set; }
    
    // Navigation properties
    public User? CreatedBy { get; set; }
    public ICollection<EventConfirmation> Confirmations { get; set; } = new List<EventConfirmation>();
    public ICollection<EventNotification> Notifications { get; set; } = new List<EventNotification>();
}

public class EventConfirmation
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid UserId { get; set; }
    public ConfirmationStatus Status { get; set; }
    public DateTime ResponseDate { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Event? Event { get; set; }
    public User? User { get; set; }
}

public enum ConfirmationStatus
{
    Pending,
    Confirmed,
    Declined
}

public class EventNotification
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid UserId { get; set; }
    public bool Sent { get; set; }
    public DateTime? SentAt { get; set; }
    public string? MessageSid { get; set; }
    
    // Navigation properties
    public Event? Event { get; set; }
    public User? User { get; set; }
}
