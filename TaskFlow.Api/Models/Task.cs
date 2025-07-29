namespace TaskFlow.Api.Models
{
    public class Task
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DueDate { get; set; }

        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public int? CategoryId { get; set; }
        public virtual Category? Category { get; set; }
    }
}
