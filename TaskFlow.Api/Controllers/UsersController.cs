using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Api.Services;
using TaskFlow.Api;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace TaskFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly TaskFlowDbContext _dbContext;
        private readonly JwtService _jwtService;

        public UsersController(TaskFlowDbContext dbContext, JwtService jwtService)
        {
            _dbContext = dbContext;
            _jwtService = jwtService;
        }

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

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(avatar.FileName)}";
            var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(uploadDir);
            var filePath = Path.Combine(uploadDir, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await avatar.CopyToAsync(stream);
            }

            user.AvatarUrl = $"/uploads/{fileName}";
            await _dbContext.SaveChangesAsync();

            return Ok(new { url = user.AvatarUrl });
        }
    }
}
