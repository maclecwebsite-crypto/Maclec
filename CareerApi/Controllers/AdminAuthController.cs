using Microsoft.AspNetCore.Mvc;
using CareerApi.Auth;

namespace CareerApi.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminAuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AdminAuthController(IConfiguration config)
    {
        _config = config;
    }

    public class LoginRequest
    {
        public string Password { get; set; } = string.Empty;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var adminPassword = _config["AdminSettings:Password"];

        if (string.IsNullOrEmpty(adminPassword) || request.Password != adminPassword)
        {
            return Unauthorized(new { error = "Incorrect password." });
        }

        var token = AdminTokenStore.IssueToken();
        return Ok(new { token });
    }

    [HttpPost("logout")]
    [AdminAuth]
    public IActionResult Logout()
    {
        var header = Request.Headers.Authorization.ToString();
        var token = header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? header["Bearer ".Length..].Trim()
            : null;
        AdminTokenStore.Revoke(token);
        return Ok();
    }
}
