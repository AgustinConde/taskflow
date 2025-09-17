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

        private static async Task<bool> SendConfirmationEmailAsync(User user, string token, IEmailService emailService, string baseUrl)
        {
            var confirmLink = $"{baseUrl}/confirm-email?token={token}";
            var subject = "Confirm your TaskFlow account";
            var body = $@"Hello {user.Username},

Thank you for registering with TaskFlow!

To complete your registration and activate your account, please click the link below:
{confirmLink}

If you did not create this account, please ignore this email.

Best regards,
TaskFlow Team";

            try
            {
                await emailService.SendEmailAsync(user.Email, subject, body);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<UserToken?> GetUserTokenByTokenAsync(string token)
        {
            return await _context.UserTokens.FirstOrDefaultAsync(t => t.Token == token && t.Type == TokenType.Confirmation);
        }

        public async Task<bool> ResendConfirmationEmailAsync(string email, IEmailService emailService, string baseUrl)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || user.EmailConfirmed)
                return false;

            var userToken = await _context.UserTokens.FirstOrDefaultAsync(ut => ut.UserId == user.Id.ToString() && ut.Type == TokenType.Confirmation);
            if (userToken == null)
            {
                userToken = new UserToken
                {
                    UserId = user.Id.ToString(),
                    Token = Guid.NewGuid().ToString(),
                    Expiration = DateTime.UtcNow.AddDays(1),
                    Type = TokenType.Confirmation
                };
                _context.UserTokens.Add(userToken);
                await _context.SaveChangesAsync();
            }

            return await SendConfirmationEmailAsync(user, userToken.Token, emailService, baseUrl);
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto, IEmailService emailService, string baseUrl)
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

            var confirmationToken = Guid.NewGuid().ToString();
            var userToken = new UserToken
            {
                UserId = user.Id.ToString(),
                Token = confirmationToken,
                Expiration = DateTime.UtcNow.AddDays(1),
                Type = TokenType.Confirmation
            };
            _context.UserTokens.Add(userToken);
            await _context.SaveChangesAsync();

            var emailSent = await SendConfirmationEmailAsync(user, confirmationToken, emailService, baseUrl);
            if (!emailSent)
            {
                _context.UserTokens.Remove(userToken);
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return null;
            }

            return new AuthResponseDto
            {
                Username = user.Username,
                Email = user.Email,
                Token = string.Empty,
                ExpiresAt = DateTime.UtcNow.AddDays(1),
                AvatarUrl = user.AvatarUrl
            };
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash, user.Salt))
                return null;

            if (!user.EmailConfirmed)
                throw new InvalidOperationException("EMAIL_NOT_CONFIRMED");

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
        public enum ConfirmEmailResult
        {
            Success,
            AlreadyConfirmed,
            Expired,
            Invalid
        }

        public async Task<ConfirmEmailResult> ConfirmEmailAsync(string token)
        {
            var userToken = await _context.UserTokens
                .FirstOrDefaultAsync(t => t.Token == token && t.Type == TokenType.Confirmation);
            if (userToken == null)
            {
                return ConfirmEmailResult.Invalid;
            }

            if (userToken.Expiration < DateTime.UtcNow)
            {
                return ConfirmEmailResult.Expired;
            }

            var user = await _context.Users.FindAsync(int.Parse(userToken.UserId));
            if (user == null)
            {
                return ConfirmEmailResult.Invalid;
            }

            if (user.EmailConfirmed)
            {
                return ConfirmEmailResult.AlreadyConfirmed;
            }

            user.EmailConfirmed = true;
            _context.UserTokens.Remove(userToken);
            await _context.SaveChangesAsync();
            return ConfirmEmailResult.Success;
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
            var subject = "Reset your TaskFlow password";
            var body = $@"Hello {user.Username},

We received a request to reset your TaskFlow account password.

To reset your password, please click the link below:
{resetLink}

This link will expire in 1 hour for security reasons.

If you did not request this password reset, please ignore this email.

Best regards,
TaskFlow Team";
            await emailService.SendEmailAsync(user.Email, subject, body);
            return;
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
