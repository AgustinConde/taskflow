using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Services;
using static TaskFlow.Api.Services.AuthService;

namespace TaskFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly JwtService _jwtService;
        private readonly EmailQueueService _emailQueueService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            AuthService authService,
            JwtService jwtService,
            EmailQueueService emailQueueService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _jwtService = jwtService;
            _emailQueueService = emailQueueService;
            _logger = logger;
        }

        [HttpPost("resend-confirmation")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ResendConfirmation([FromBody] ResendConfirmationDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
            var result = await _authService.ResendConfirmationEmailAsync(request.Email, frontendUrl);
            if (!result)
                return BadRequest(new { message = "auth.resend.not_eligible" });
            return Ok(new { message = "auth.resend.success" });
        }

        [HttpPost("register")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
            var result = await _authService.RegisterAsync(registerDto, frontendUrl);
            if (result == null)
                return Conflict(new { message = "auth.register.exists" });

            return Ok(new { message = "auth.register.success" });
        }

        [HttpPost("login")]
        [EnableRateLimiting("auth")]
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
            token = token?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest(new { message = "auth.confirm.invalid_token" });
            }

            var userToken = await _authService.GetUserTokenByTokenAsync(token);
            var user = userToken != null ? await _authService.GetUserByIdAsync(int.Parse(userToken.UserId)) : null;
            var result = await _authService.ConfirmEmailAsync(token);
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
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
            await _authService.RequestPasswordResetAsync(dto.Email, frontendUrl);
            return Ok(new { message = "auth.forgot.sent" });
        }

        [HttpPost("reset")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var ok = await _authService.ResetPasswordAsync(dto.Token, dto.NewPassword);
            if (!ok) return BadRequest(new { message = "auth.reset.invalid_token" });
            return Ok(new { message = "auth.reset.success" });
        }
    }
}
