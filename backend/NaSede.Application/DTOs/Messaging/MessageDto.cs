namespace NaSede.Application.DTOs.Messaging;

public class SendMessageRequest
{
    public string Message { get; set; } = string.Empty;
    public List<Guid> UserIds { get; set; } = new();
    public bool SendToAll { get; set; }
}

public class MessageResponse
{
    public int TotalSent { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public List<string> FailedNumbers { get; set; } = new();
}
