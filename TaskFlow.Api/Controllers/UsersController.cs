using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Api.Services;

namespace TaskFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController(TaskFlowDbContext dbContext, JwtService jwtService) : ControllerBase
    {
        private readonly TaskFlowDbContext _dbContext = dbContext;
        private readonly JwtService _jwtService = jwtService;

        // POST: api/users/photo
        [HttpPost("photo")]
        public async Task<IActionResult> UploadPhoto([FromForm] IFormFile avatar)
        {
            if (avatar == null || avatar.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(avatar.ContentType))
                return BadRequest(new { message = "Invalid file type." });

            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
                return Unauthorized();

            var user = await _dbContext.Users.FindAsync(userId.Value);
            if (user == null)
                return NotFound();

            var safeUsername = string.Concat(user.Username.ToLower().Select(c =>
                (char.IsLetterOrDigit(c) || c == '-' || c == '_') ? c : '_'));
            var ext = Path.GetExtension(avatar.FileName);
            var avatarDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatar");
            Directory.CreateDirectory(avatarDir);
            var fileName = $"{safeUsername}{ext}";
            var filePath = Path.Combine(avatarDir, fileName);

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await avatar.CopyToAsync(stream);
            }

            user.AvatarUrl = $"/uploads/avatar/{fileName}";
            await _dbContext.SaveChangesAsync();

            return Ok(new { url = user.AvatarUrl });
        }
    }
}
