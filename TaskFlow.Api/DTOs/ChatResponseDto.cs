namespace TaskFlow.Api.DTOs
{
    public class ChatResponseDto
    {
        public required string Message { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool IsRestricted { get; set; } = false;
        public string? SuggestedAction { get; set; }
        public object? ActionData { get; set; }
    }
}
