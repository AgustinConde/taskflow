using System.ComponentModel.DataAnnotations;

namespace TaskFlow.Api.DTOs
{
    public class RegisterDto
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        [RegularExpression("^[a-zA-Z0-9_-]+$", ErrorMessage = "Username can only contain letters, numbers, hyphens and underscores.")]
        public required string Username { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public required string Email { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public required string Password { get; set; }
    }

    public class LoginDto
    {
        [Required]
        public required string Username { get; set; }

        [Required]
        public required string Password { get; set; }
    }

    public class AuthResponseDto
    {
        public required string Token { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
