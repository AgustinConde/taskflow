using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Models;

namespace TaskFlow.Api.Services
{
    public class AuthService(TaskFlowDbContext context, JwtService jwtService)
    {
        private readonly TaskFlowDbContext _context = context;
        private readonly JwtService _jwtService = jwtService;

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
                return null;

            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                return null;

            var salt = GenerateSalt();
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Salt = salt,
                PasswordHash = HashPassword(registerDto.Password, salt),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user.Id, user.Username, user.Email);

            return new AuthResponseDto
            {
                Token = token,
                Username = user.Username,
                Email = user.Email,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash, user.Salt))
                return null;

            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user.Id, user.Username, user.Email);

            return new AuthResponseDto
            {
                Token = token,
                Username = user.Username,
                Email = user.Email,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                AvatarUrl = user.AvatarUrl
            };
        }

        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                AvatarUrl = user.AvatarUrl
            };
        }

        public static string HashPassword(string password, string salt)
        {
            var hashedBytes = SHA256.HashData(Encoding.UTF8.GetBytes(password + salt));
            return Convert.ToBase64String(hashedBytes);
        }

        public static bool VerifyPassword(string password, string hash, string salt)
        {
            var hashedInput = HashPassword(password, salt);
            return hashedInput == hash;
        }

        public static string GenerateSalt(int size = 16)
        {
            var bytes = new byte[size];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }

        public async Task<bool> ConfirmEmailAsync(string token)
        {
            var userToken = await _context.UserTokens
                .FirstOrDefaultAsync(t => t.Token == token && t.Type == TokenType.Confirmation && t.Expiration > DateTime.UtcNow);

            if (userToken == null) return false;

            var user = await _context.Users.FindAsync(int.Parse(userToken.UserId));
            if (user == null) return false;

            user.EmailConfirmed = true;
            _context.UserTokens.Remove(userToken);
            await _context.SaveChangesAsync();
            return true;
        }

        public async System.Threading.Tasks.Task RequestPasswordResetAsync(string email, IEmailService emailService, string baseUrl)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return;

            var token = Guid.NewGuid().ToString();
            _context.UserTokens.Add(new UserToken
            {
                UserId = user.Id.ToString(),
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(1),
                Type = TokenType.PasswordReset
            });
            await _context.SaveChangesAsync();

            var resetLink = $"{baseUrl}/reset-password?token={token}";
            await emailService.SendEmailAsync(user.Email, "Recupera tu contraseña", $"Haz click aquí para resetear tu contraseña: {resetLink}");
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            var userToken = await _context.UserTokens
                .FirstOrDefaultAsync(t => t.Token == token && t.Type == TokenType.PasswordReset && t.Expiration > DateTime.UtcNow);

            if (userToken == null) return false;

            var user = await _context.Users.FindAsync(int.Parse(userToken.UserId));
            if (user == null) return false;

            var newSalt = GenerateSalt();
            user.Salt = newSalt;
            user.PasswordHash = HashPassword(newPassword, newSalt);

            _context.UserTokens.Remove(userToken);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
