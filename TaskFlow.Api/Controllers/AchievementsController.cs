using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Api.Services;
using TaskFlow.Api.DTOs;
using System.Security.Claims;

namespace TaskFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AchievementsController(IAchievementService achievementService, ILogger<AchievementsController> logger) : ControllerBase
    {
        private readonly IAchievementService _achievementService = achievementService;
        private readonly ILogger<AchievementsController> _logger = logger;

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID not found in token");
        }

        [HttpGet]
        public async Task<ActionResult<List<AchievementDto>>> GetAchievements()
        {
            try
            {
                var achievements = await _achievementService.GetAchievementsAsync();
                return Ok(achievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting achievements");
                return StatusCode(500, "An error occurred while getting achievements");
            }
        }

        [HttpGet("progress")]
        public async Task<ActionResult<List<UserAchievementProgressDto>>> GetUserProgress()
        {
            try
            {
                var userId = GetCurrentUserId();
                var progress = await _achievementService.GetUserProgressAsync(userId);
                return Ok(progress);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user achievement progress");
                return StatusCode(500, "An error occurred while getting achievement progress");
            }
        }

        [HttpPut("progress")]
        public async Task<ActionResult> UpdateProgress([FromBody] UpdateAchievementProgressDto progressDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _achievementService.UpdateProgressAsync(userId, progressDto);
                return Ok();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating achievement progress");
                return StatusCode(500, "An error occurred while updating achievement progress");
            }
        }

        [HttpGet("stats")]
        public async Task<ActionResult<UserAchievementStatsDto>> GetUserStats()
        {
            try
            {
                var userId = GetCurrentUserId();
                var stats = await _achievementService.GetUserStatsAsync(userId);
                return Ok(stats);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user achievement stats");
                return StatusCode(500, "An error occurred while getting achievement stats");
            }
        }

        [HttpPost("events")]
        public async Task<ActionResult> TrackEvent([FromBody] CreateAchievementEventDto eventDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _achievementService.TrackEventAsync(userId, eventDto);
                return Ok();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking achievement event");
                return StatusCode(500, "An error occurred while tracking achievement event");
            }
        }

        [HttpPost("initialize")]
        public async Task<ActionResult> InitializeUserAchievements()
        {
            try
            {
                var userId = GetCurrentUserId();
                await _achievementService.InitializeUserAchievementsAsync(userId);
                return Ok();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing user achievements");
                return StatusCode(500, "An error occurred while initializing achievements");
            }
        }

        [HttpGet("notifications")]
        public async Task<ActionResult<List<AchievementNotificationDto>>> GetNotifications()
        {
            try
            {
                var userId = GetCurrentUserId();
                var notifications = await _achievementService.ProcessAchievementEvents(userId);
                return Ok(notifications);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting achievement notifications");
                return StatusCode(500, "An error occurred while getting notifications");
            }
        }
    }
}