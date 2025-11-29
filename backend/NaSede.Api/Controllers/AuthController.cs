using Microsoft.AspNetCore.Mvc;
using NaSede.Application.DTOs.Auth;
using NaSede.Application.Interfaces;

namespace NaSede.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        
        if (response == null)
            return Unauthorized(new { message = "Credenciais inválidas" });

        return Ok(response);
    }

    [HttpPost("whatsapp")]
    public async Task<IActionResult> LoginWithWhatsApp([FromBody] WhatsAppLoginRequest request)
    {
        var response = await _authService.LoginWithWhatsAppTokenAsync(request.Token);
        
        if (response == null)
            return Unauthorized(new { message = "Token inválido ou expirado" });

        return Ok(response);
    }
}

public class WhatsAppLoginRequest
{
    public string Token { get; set; } = string.Empty;
}
