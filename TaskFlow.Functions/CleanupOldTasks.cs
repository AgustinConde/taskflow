using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace TaskFlow.Functions;

public class CleanupOldTasks(ILogger<CleanupOldTasks> logger)
{
    private readonly ILogger<CleanupOldTasks> _logger = logger;

    [Function("CleanupOldTasks")]
    public async Task Run([TimerTrigger("0 0 2 * * *")] TimerInfo timerInfo)     //2:00 AM UTC
    {
        _logger.LogInformation("CleanupOldTasks function executed at: {Time}", DateTime.UtcNow);

        try
        {
            // TODO: cleanup logic
            _logger.LogInformation("Cleanup task would run here. Next execution: {NextRun}", timerInfo.ScheduleStatus?.Next);

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cleanup task");
        }
    }
}
