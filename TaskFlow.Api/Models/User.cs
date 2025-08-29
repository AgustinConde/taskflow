using System.ComponentModel.DataAnnotations;

namespace TaskFlow.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public required string Username { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public required string Email { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }

        public string? AvatarUrl { get; set; }

        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
        public virtual ICollection<Category> Categories { get; set; } = new List<Category>();
    }
}
