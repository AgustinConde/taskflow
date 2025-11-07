namespace TaskFlow.Functions.Models;

public class TaskItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }

    public User? User { get; set; }
}
