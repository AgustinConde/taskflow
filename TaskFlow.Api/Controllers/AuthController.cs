using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Services;

namespace TaskFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(AuthService _authService, JwtService _jwtService) : ControllerBase
    {

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var emailService = HttpContext.RequestServices.GetService(typeof(IEmailService)) as IEmailService;
            var result = await _authService.RegisterAsync(registerDto, emailService!, baseUrl);
            if (result == null)
                return Conflict(new { message = "auth.register.exists" });

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _authService.LoginAsync(loginDto);
                if (result == null)
                    return Unauthorized(new { message = "auth.login.invalid" });

                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message == "EMAIL_NOT_CONFIRMED")
            {
                return Unauthorized(new { message = "auth.login.emailNotConfirmed" });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
                return Unauthorized();

            var user = await _authService.GetUserByIdAsync(userId.Value);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpGet("validate")]
        [Authorize]
        public IActionResult ValidateToken()
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
                return Unauthorized(new { valid = false });

            return Ok(new { valid = true, userId });
        }

        [HttpGet("confirm")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string token)
        {
            var ok = await _authService.ConfirmEmailAsync(token);
            if (!ok) return BadRequest(new { message = "auth.confirm.invalid_token" });
            return Ok(new { message = "auth.confirm.success" });
        }

        [HttpPost("forgot")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto, [FromServices] IEmailService emailService)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            await _authService.RequestPasswordResetAsync(dto.Email, emailService, baseUrl);
            return Ok(new { message = "auth.forgot.sent" });
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var ok = await _authService.ResetPasswordAsync(dto.Token, dto.NewPassword);
            if (!ok) return BadRequest(new { message = "auth.reset.invalid_token" });
            return Ok(new { message = "auth.reset.success" });
        }
    }
}
