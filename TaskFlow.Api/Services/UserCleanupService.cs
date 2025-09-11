using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using TaskFlow.Api.Models;

namespace TaskFlow.Api.Services
{
    public class UserCleanupService(IServiceProvider serviceProvider) : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider = serviceProvider;
        private readonly TimeSpan _interval = TimeSpan.FromHours(24);
        private readonly int _days = 3;

        protected override async System.Threading.Tasks.Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var db = scope.ServiceProvider.GetRequiredService<TaskFlowDbContext>();
                    var cutoff = DateTime.UtcNow.AddDays(-_days);
                    var usersToDelete = await db.Users
                        .Where(u => !u.EmailConfirmed && u.CreatedAt < cutoff)
                        .ToListAsync(stoppingToken);
                    if (usersToDelete.Count > 0)
                    {
                        db.Users.RemoveRange(usersToDelete);
                        await db.SaveChangesAsync(stoppingToken);
                    }
                }
                await System.Threading.Tasks.Task.Delay(_interval, stoppingToken);
            }
        }
    }
}
