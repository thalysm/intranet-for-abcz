namespace NaSede.Application.DTOs.Requests;

public class RequestDto
{
    public Guid Id { get; set; }
    public Guid TypeId { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? Response { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateRequestRequest
{
    public Guid TypeId { get; set; }
}

public class UpdateRequestStatusRequest
{
    public int Status { get; set; }
    public string? Response { get; set; }
}

public class RequestTypeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateRequestTypeRequest
{
    public string Name { get; set; } = string.Empty;
}