using Microsoft.AspNetCore.Mvc;

namespace NaSede.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { 
            status = "healthy", 
            service = "Na Sede API",
            timestamp = DateTime.UtcNow 
        });
    }
}
