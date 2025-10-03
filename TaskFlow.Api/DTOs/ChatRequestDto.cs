using System.ComponentModel.DataAnnotations;

namespace TaskFlow.Api.DTOs
{
    public class ChatRequestDto
    {
        [Required]
        [StringLength(2000, ErrorMessage = "Message cannot exceed 2000 characters")]
        public required string Message { get; set; }

        [MaxLength(10, ErrorMessage = "Conversation history limited to 10 messages")]
        public List<ChatMessageDto>? ConversationHistory { get; set; }

        public bool IncludeTaskContext { get; set; } = true;

        public bool IncludeCategoryContext { get; set; } = true;

        public bool IncludeAchievementContext { get; set; } = false;

        [MaxLength(5)]
        public string Language { get; set; } = "es";
    }
}
