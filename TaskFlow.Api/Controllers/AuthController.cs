using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Services;
using static TaskFlow.Api.Services.AuthService;

namespace TaskFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(AuthService authService, JwtService jwtService) : ControllerBase
    {
        private readonly AuthService _authService = authService;
        private readonly JwtService _jwtService = jwtService;

        [HttpPost("resend-confirmation")]
        public async Task<IActionResult> ResendConfirmation([FromBody] string email)
        {
            var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
            var emailService = HttpContext.RequestServices.GetService(typeof(IEmailService)) as IEmailService;
            var result = await _authService.ResendConfirmationEmailAsync(email, emailService!, frontendUrl);
            if (!result)
                return BadRequest(new { message = "auth.resend.not_eligible" });
            return Ok(new { message = "auth.resend.success" });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
            var emailService = HttpContext.RequestServices.GetService(typeof(IEmailService)) as IEmailService;
            var result = await _authService.RegisterAsync(registerDto, emailService!, frontendUrl);
            if (result == null)
                return Conflict(new { message = "auth.register.exists" });

            return Ok(new { message = "auth.register.success" });
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
            var result = await _authService.ConfirmEmailAsync(token);
            var userToken = await _authService.GetUserTokenByTokenAsync(token);
            var user = userToken != null ? await _authService.GetUserByIdAsync(int.Parse(userToken.UserId)) : null;
            if (result == ConfirmEmailResult.Success && user != null)
            {
                var jwt = _jwtService.GenerateToken(user.Id, user.Username, user.Email);
                var response = new AuthResponseDto
                {
                    Token = jwt,
                    Username = user.Username,
                    Email = user.Email,
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    AvatarUrl = user.AvatarUrl
                };
                return Ok(response);
            }
            if (result == ConfirmEmailResult.AlreadyConfirmed && user != null)
            {
                var jwt = _jwtService.GenerateToken(user.Id, user.Username, user.Email);
                var response = new AuthResponseDto
                {
                    Token = jwt,
                    Username = user.Username,
                    Email = user.Email,
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    AvatarUrl = user.AvatarUrl
                };
                return Ok(response);
            }
            if (result == ConfirmEmailResult.Expired)
                return BadRequest(new { message = "auth.confirm.expired" });
            return BadRequest(new { message = "auth.confirm.invalid_token" });
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
