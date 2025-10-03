using System.ComponentModel.DataAnnotations;

namespace TaskFlow.Api.DTOs
{
    public class ChatMessageDto
    {
        [Required]
        public required string Role { get; set; } // "user" or "assistant"

        [Required]
        [StringLength(5000, ErrorMessage = "Message cannot exceed 5000 characters")]
        public required string Content { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
