using System.ComponentModel.DataAnnotations;

namespace TaskFlow.Api.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [StringLength(100, ErrorMessage = "Title can't be longer than 100 characters")]
        public required string Title { get; set; }

        [StringLength(500, ErrorMessage = "Description can't be longer than 500 characters")]
        public string? Description { get; set; }

        public bool IsCompleted { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? DueDate { get; set; }

        public int UserId { get; set; }
        public int? CategoryId { get; set; }
    }
}

