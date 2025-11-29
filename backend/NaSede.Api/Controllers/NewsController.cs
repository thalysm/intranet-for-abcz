using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaSede.Application.DTOs.News;
using NaSede.Application.Interfaces;
using NaSede.Domain.Entities;
using NaSede.Infrastructure.Data;
using System.Security.Claims;

namespace NaSede.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITwilioService _twilioService;
    private readonly IConfiguration _configuration;

    public NewsController(
        ApplicationDbContext context,
        ITwilioService twilioService,
        IConfiguration configuration)
    {
        _context = context;
        _twilioService = twilioService;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<ActionResult<List<NewsDto>>> GetNews()
    {
        var news = await _context.News
            .Include(n => n.CreatedBy)
            .Include(n => n.Comments)
                .ThenInclude(c => c.User)
            .OrderByDescending(n => n.PublishedAt)
            .Select(n => new NewsDto
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                ImageUrl = n.ImageUrl,
                PublishedAt = n.PublishedAt,
                CreatedByUserId = n.CreatedByUserId,
                CreatedByName = n.CreatedBy!.Name,
                Comments = n.Comments.OrderBy(c => c.CreatedAt).Select(c => new NewsCommentDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    UserName = c.User!.Name,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                }).ToList()
            })
            .ToListAsync();

        return Ok(news);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<NewsDto>> GetNewsById(Guid id)
    {
        var news = await _context.News
            .Include(n => n.CreatedBy)
            .Include(n => n.Comments)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (news == null)
            return NotFound();

        var dto = new NewsDto
        {
            Id = news.Id,
            Title = news.Title,
            Content = news.Content,
            ImageUrl = news.ImageUrl,
            PublishedAt = news.PublishedAt,
            CreatedByUserId = news.CreatedByUserId,
            CreatedByName = news.CreatedBy!.Name,
            Comments = news.Comments.OrderBy(c => c.CreatedAt).Select(c => new NewsCommentDto
            {
                Id = c.Id,
                UserId = c.UserId,
                UserName = c.User!.Name,
                Content = c.Content,
                CreatedAt = c.CreatedAt
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<NewsDto>> CreateNews([FromBody] CreateNewsRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var news = new News
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            ImageUrl = request.ImageUrl,
            CreatedByUserId = userId,
            PublishedAt = DateTime.UtcNow
        };

        _context.News.Add(news);
        await _context.SaveChangesAsync();

        // Send WhatsApp notifications
        if (request.NotifyAll || request.NotifyUserIds.Any())
        {
            var usersToNotify = request.NotifyAll
                ? await _context.Users.Where(u => u.WhatsAppNumber != null).ToListAsync()
                : await _context.Users.Where(u => request.NotifyUserIds.Contains(u.Id) && u.WhatsAppNumber != null).ToListAsync();

            var frontendUrl = _configuration["Frontend:Url"] ?? "http://localhost:4200";
            var newsLink = $"{frontendUrl}/dashboard?newsId={news.Id}";

            foreach (var user in usersToNotify)
            {
                var message = $"📰 *Nova Notícia - ABCZ*\n\n*{news.Title}*\n\n{news.Content.Substring(0, Math.Min(150, news.Content.Length))}...\n\nLeia mais: {newsLink}";
                await _twilioService.SendWhatsAppMessageAsync(user.WhatsAppNumber!, message);
            }
        }

        var createdNews = await _context.News
            .Include(n => n.CreatedBy)
            .FirstAsync(n => n.Id == news.Id);

        return CreatedAtAction(nameof(GetNewsById), new { id = news.Id }, new NewsDto
        {
            Id = createdNews.Id,
            Title = createdNews.Title,
            Content = createdNews.Content,
            ImageUrl = createdNews.ImageUrl,
            PublishedAt = createdNews.PublishedAt,
            CreatedByUserId = createdNews.CreatedByUserId,
            CreatedByName = createdNews.CreatedBy!.Name
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<NewsDto>> UpdateNews(Guid id, [FromBody] UpdateNewsRequest request)
    {
        var news = await _context.News.FindAsync(id);

        if (news == null)
            return NotFound();

        news.Title = request.Title;
        news.Content = request.Content;
        news.ImageUrl = request.ImageUrl;

        await _context.SaveChangesAsync();

        var updatedNews = await _context.News
            .Include(n => n.CreatedBy)
            .FirstAsync(n => n.Id == id);

        return Ok(new NewsDto
        {
            Id = updatedNews.Id,
            Title = updatedNews.Title,
            Content = updatedNews.Content,
            ImageUrl = updatedNews.ImageUrl,
            PublishedAt = updatedNews.PublishedAt,
            CreatedByUserId = updatedNews.CreatedByUserId,
            CreatedByName = updatedNews.CreatedBy!.Name
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteNews(Guid id)
    {
        var news = await _context.News.FindAsync(id);

        if (news == null)
            return NotFound();

        _context.News.Remove(news);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/comments")]
    public async Task<ActionResult<NewsCommentDto>> AddComment(Guid id, [FromBody] CreateCommentRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var news = await _context.News.FindAsync(id);
        if (news == null)
            return NotFound();

        var comment = new NewsComment
        {
            Id = Guid.NewGuid(),
            NewsId = id,
            UserId = userId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        _context.NewsComments.Add(comment);
        await _context.SaveChangesAsync();

        var createdComment = await _context.NewsComments
            .Include(c => c.User)
            .FirstAsync(c => c.Id == comment.Id);

        return Ok(new NewsCommentDto
        {
            Id = createdComment.Id,
            UserId = createdComment.UserId,
            UserName = createdComment.User!.Name,
            Content = createdComment.Content,
            CreatedAt = createdComment.CreatedAt
        });
    }

    [HttpDelete("{newsId}/comments/{commentId}")]
    public async Task<IActionResult> DeleteComment(Guid newsId, Guid commentId)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var isAdmin = User.IsInRole("Admin");

        var comment = await _context.NewsComments.FindAsync(commentId);

        if (comment == null || comment.NewsId != newsId)
            return NotFound();

        if (comment.UserId != userId && !isAdmin)
            return Forbid();

        _context.NewsComments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
