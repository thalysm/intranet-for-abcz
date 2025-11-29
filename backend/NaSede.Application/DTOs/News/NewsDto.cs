namespace NaSede.Application.DTOs.News;

public class NewsDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime PublishedAt { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string? CreatedByName { get; set; }
    public List<NewsCommentDto> Comments { get; set; } = new();
}

public class CreateNewsRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public List<Guid> NotifyUserIds { get; set; } = new();
    public bool NotifyAll { get; set; }
}

public class UpdateNewsRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

public class NewsCommentDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateCommentRequest
{
    public string Content { get; set; } = string.Empty;
}
