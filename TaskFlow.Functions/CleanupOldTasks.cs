using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Functions.Data;

namespace TaskFlow.Functions;

public class CleanupOldTasks
{
    private readonly TaskFlowDbContext _dbContext;

    public CleanupOldTasks(TaskFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [Function("CleanupOldTasks")]
    public async Task Run([TimerTrigger("0 0 2 * * *")] TimerInfo timerInfo)     //2:00 AM UTC
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-90);

        var userIdsWithAutoDelete = await _dbContext.Users
            .Where(u => u.AutoDeleteCompletedTasks)
            .Select(u => u.Id)
            .ToListAsync();

        if (!userIdsWithAutoDelete.Any())
        {
            return;
        }

        var tasksToDelete = await _dbContext.Tasks
            .Where(t => userIdsWithAutoDelete.Contains(t.UserId) &&
                       t.IsCompleted &&
                       t.CreatedAt < cutoffDate)
            .ToListAsync();

        if (!tasksToDelete.Any())
        {
            return;
        }

        _dbContext.Tasks.RemoveRange(tasksToDelete);
        await _dbContext.SaveChangesAsync();
    }
}
