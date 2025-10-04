using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Services;

namespace TaskFlow.Api.Controllers
{
    [ApiController]
    [Route("api/ai-assistant")]
    [Authorize]
    [EnableRateLimiting("api")] // Requires JWT authentication
    public class AIAssistantController(
        AIAssistantService aiAssistantService,
        ILogger<AIAssistantController> logger) : ControllerBase
    {
        private readonly AIAssistantService _aiAssistantService = aiAssistantService;
        private readonly ILogger<AIAssistantController> _logger = logger;

        [HttpPost("chat")]
        [ProducesResponseType(typeof(ChatResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
        public async Task<IActionResult> Chat([FromBody] ChatRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                _logger.LogWarning("Invalid user ID in JWT token");
                return Unauthorized(new { message = "aiAssistant.unauthorized" });
            }

            try
            {
                _logger.LogInformation("User {UserId} sending message to AI Assistant", userId);

                var response = await _aiAssistantService.SendMessageAsync(request, userId, request.Language ?? "es");

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing AI Assistant request for user {UserId}", userId);
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new { message = "aiAssistant.error", error = "An error occurred while processing your request" }
                );
            }
        }

        [HttpGet("status")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetStatus()
        {
            var isAvailable = await _aiAssistantService.IsAIAvailableAsync();
            var providerName = _aiAssistantService.GetProviderName();

            return Ok(new
            {
                available = isAvailable,
                provider = providerName,
                message = isAvailable
                    ? "AI Assistant is ready"
                    : "AI Assistant is not available. Please check that Ollama is running."
            });
        }
    }
}
