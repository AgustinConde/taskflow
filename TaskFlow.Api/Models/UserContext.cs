namespace TaskFlow.Api.Models
{
    public class UserContext
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public List<TaskSummary> Tasks { get; set; } = new();
        public List<CategorySummary> Categories { get; set; } = new();
        public AchievementStats? Achievements { get; set; }
    }

    public class TaskSummary
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? DueDate { get; set; }
        public string? CategoryName { get; set; }
        public bool HasLocation { get; set; }
    }

    public class CategorySummary
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public int TaskCount { get; set; }
    }

    public class AchievementStats
    {
        public int TotalPoints { get; set; }
        public int Level { get; set; }
        public int CompletedTasksLast30Days { get; set; }
        public int CurrentStreak { get; set; }
    }
}
