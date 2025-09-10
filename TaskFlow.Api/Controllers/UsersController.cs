using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Services;
using TaskFlow.Api.DTOs;

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
                return BadRequest(new { message = "user.photo.no_file" });

            var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(avatar.ContentType))
                return BadRequest(new { message = "user.photo.invalid_type" });

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
        // PUT: api/users/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
                return Unauthorized();

            var user = await _dbContext.Users.FindAsync(userId.Value);
            if (user == null)
                return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Username) && dto.Username != user.Username)
            {
                if (await _dbContext.Users.AnyAsync(u => u.Username == dto.Username))
                    return Conflict(new { message = "user.profile.username_exists" });

                if (!string.IsNullOrEmpty(user.AvatarUrl))
                {
                    var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.AvatarUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                    var ext = Path.GetExtension(oldPath);
                    var safeNewUsername = string.Concat(dto.Username.ToLower().Select(c => (char.IsLetterOrDigit(c) || c == '-' || c == '_') ? c : '_'));
                    var newFileName = $"{safeNewUsername}{ext}";
                    var newPath = Path.Combine(Path.GetDirectoryName(oldPath)!, newFileName);
                    if (System.IO.File.Exists(oldPath))
                    {
                        System.IO.File.Move(oldPath, newPath, true);
                        user.AvatarUrl = $"/uploads/avatar/{newFileName}";
                    }
                }
                user.Username = dto.Username;
            }

            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != user.Email)
            {
                if (await _dbContext.Users.AnyAsync(u => u.Email == dto.Email))
                    return Conflict(new { message = "user.profile.email_exists" });
                user.Email = dto.Email;
            }

            if (!string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || !AuthService.VerifyPassword(dto.CurrentPassword, user.PasswordHash, user.Salt))
                    return BadRequest(new { message = "user.profile.current_password_incorrect" });
                var newSalt = AuthService.GenerateSalt();
                user.Salt = newSalt;
                user.PasswordHash = AuthService.HashPassword(dto.NewPassword, newSalt);
            }

            await _dbContext.SaveChangesAsync();
            return Ok(new { message = "user.profile.updated", avatarUrl = user.AvatarUrl });
        }
    }
}
