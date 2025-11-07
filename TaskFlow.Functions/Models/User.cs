namespace TaskFlow.Functions.Models;

public class User
{
    public int Id { get; set; }
    public bool AutoDeleteCompletedTasks { get; set; }

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
