using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Models;
using TaskFlow.Api.DTOs;
using System.Text.Json;

namespace TaskFlow.Api.Services
{
    public interface IAchievementService
    {
        Task<List<AchievementDto>> GetAchievementsAsync();
        Task<List<UserAchievementProgressDto>> GetUserProgressAsync(int userId);
        Task<UserAchievementStatsDto> GetUserStatsAsync(int userId);
        System.Threading.Tasks.Task UpdateProgressAsync(int userId, UpdateAchievementProgressDto progressDto);
        System.Threading.Tasks.Task TrackEventAsync(int userId, CreateAchievementEventDto eventDto);
        System.Threading.Tasks.Task InitializeUserAchievementsAsync(int userId);
        Task<List<AchievementNotificationDto>> ProcessAchievementEvents(int userId);
    }

    public class AchievementService(TaskFlowDbContext context, ILogger<AchievementService> logger) : IAchievementService
    {
        private readonly TaskFlowDbContext _context = context;
        private readonly ILogger<AchievementService> _logger = logger;

        public async Task<List<AchievementDto>> GetAchievementsAsync()
        {
            var achievements = await _context.Achievements
                .Include(a => a.Tiers)
                .OrderBy(a => a.Category)
                .ThenBy(a => a.Key)
                .ToListAsync();

            return [.. achievements.Select(a => new AchievementDto
            {
                Id = a.Id,
                Key = a.Key,
                Category = a.Category,
                Type = a.Type,
                Icon = a.Icon,
                Color = a.Color,
                IsHidden = a.IsHidden,
                Tiers = [.. a.Tiers.OrderBy(t => t.SortOrder).Select(t => new AchievementTierDto
                {
                    Id = t.Id,
                    Level = t.Level,
                    Target = t.Target,
                    Points = t.Points
                })]
            })];
        }

        public async Task<List<UserAchievementProgressDto>> GetUserProgressAsync(int userId)
        {
            var userProgress = await _context.UserAchievementProgress
                .Include(uap => uap.TierProgress)
                .ThenInclude(tp => tp.AchievementTier)
                .Where(uap => uap.UserId == userId)
                .ToListAsync();

            return [.. userProgress.Select(up => new UserAchievementProgressDto
            {
                AchievementId = up.AchievementId,
                CurrentValue = up.CurrentValue,
                UnlockedTiers = [.. up.TierProgress
                    .Where(tp => tp.IsUnlocked)
                    .Select(tp => tp.AchievementTier.Level)],
                LastUpdated = up.LastUpdated,
                FirstUnlockedAt = up.FirstUnlockedAt
            })];
        }

        public async Task<UserAchievementStatsDto> GetUserStatsAsync(int userId)
        {
            var stats = await _context.UserAchievementStats
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (stats == null)
            {
                await InitializeUserStatsAsync(userId);
                stats = await _context.UserAchievementStats
                    .FirstOrDefaultAsync(s => s.UserId == userId);
            }

            return stats != null ? new UserAchievementStatsDto
            {
                TotalPoints = stats.TotalPoints,
                TotalAchievements = stats.TotalAchievements,
                UnlockedAchievements = stats.UnlockedAchievements,
                CurrentStreak = stats.CurrentStreak,
                LongestStreak = stats.LongestStreak,
                Level = stats.Level,
                ExperiencePoints = stats.ExperiencePoints,
                NextLevelPoints = stats.NextLevelPoints
            } : new UserAchievementStatsDto();
        }

        public async System.Threading.Tasks.Task UpdateProgressAsync(int userId, UpdateAchievementProgressDto progressDto)
        {
            var userProgress = await _context.UserAchievementProgress
                .Include(uap => uap.TierProgress)
                .ThenInclude(tp => tp.AchievementTier)
                .FirstOrDefaultAsync(uap => uap.UserId == userId && uap.AchievementId == progressDto.AchievementId);

            if (userProgress == null)
            {
                userProgress = new UserAchievementProgress
                {
                    UserId = userId,
                    AchievementId = progressDto.AchievementId,
                    CurrentValue = progressDto.CurrentValue,
                    LastUpdated = DateTime.UtcNow
                };
                _context.UserAchievementProgress.Add(userProgress);
                await _context.SaveChangesAsync();
            }
            else
            {
                userProgress.CurrentValue = progressDto.CurrentValue;
                userProgress.LastUpdated = DateTime.UtcNow;
            }

            var achievement = await _context.Achievements
                .Include(a => a.Tiers)
                .FirstOrDefaultAsync(a => a.Id == progressDto.AchievementId);

            if (achievement != null)
            {
                foreach (var tierLevel in progressDto.UnlockedTiers)
                {
                    var tier = achievement.Tiers.FirstOrDefault(t => t.Level == tierLevel);
                    if (tier != null)
                    {
                        var tierProgress = userProgress.TierProgress
                            .FirstOrDefault(tp => tp.AchievementTierId == tier.Id);

                        if (tierProgress == null)
                        {
                            userProgress.TierProgress.Add(new UserAchievementTierProgress
                            {
                                AchievementTierId = tier.Id,
                                IsUnlocked = true,
                                UnlockedAt = DateTime.UtcNow
                            });

                            if (userProgress.FirstUnlockedAt == null)
                            {
                                userProgress.FirstUnlockedAt = DateTime.UtcNow;
                            }
                        }
                        else if (!tierProgress.IsUnlocked)
                        {
                            tierProgress.IsUnlocked = true;
                            tierProgress.UnlockedAt = DateTime.UtcNow;
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
            await UpdateUserStatsAsync(userId);
        }



        public async System.Threading.Tasks.Task InitializeUserAchievementsAsync(int userId)
        {
            var existingProgress = await _context.UserAchievementProgress
                .AnyAsync(uap => uap.UserId == userId);

            if (!existingProgress)
            {
                await InitializeUserStatsAsync(userId);
                _logger.LogInformation($"Initialized achievements for user {userId}");
            }
        }

        private async System.Threading.Tasks.Task InitializeUserStatsAsync(int userId)
        {
            var existingStats = await _context.UserAchievementStats
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (existingStats == null)
            {
                var totalAchievements = await _context.Achievements.CountAsync();

                var stats = new UserAchievementStats
                {
                    UserId = userId,
                    TotalPoints = 0,
                    TotalAchievements = totalAchievements,
                    UnlockedAchievements = 0,
                    CurrentStreak = 0,
                    LongestStreak = 0,
                    Level = 1,
                    ExperiencePoints = 0,
                    NextLevelPoints = 100,
                    LastUpdated = DateTime.UtcNow
                };

                _context.UserAchievementStats.Add(stats);
                await _context.SaveChangesAsync();
            }
        }

        private async System.Threading.Tasks.Task UpdateUserStatsAsync(int userId)
        {
            var userProgress = await _context.UserAchievementProgress
                .Include(uap => uap.TierProgress)
                .ThenInclude(tp => tp.AchievementTier)
                .Where(uap => uap.UserId == userId)
                .ToListAsync();

            var totalPoints = userProgress
                .SelectMany(up => up.TierProgress)
                .Where(tp => tp.IsUnlocked)
                .Sum(tp => tp.AchievementTier.Points);

            var unlockedAchievements = userProgress
                .Count(up => up.TierProgress.Any(tp => tp.IsUnlocked));

            var totalAchievements = await _context.Achievements.CountAsync();

            var (Level, ExperiencePoints, NextLevelPoints) = CalculateUserLevel(totalPoints);

            var stats = await _context.UserAchievementStats
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (stats != null)
            {
                stats.TotalPoints = totalPoints;
                stats.TotalAchievements = totalAchievements;
                stats.UnlockedAchievements = unlockedAchievements;
                stats.Level = Level;
                stats.ExperiencePoints = ExperiencePoints;
                stats.NextLevelPoints = NextLevelPoints;
                stats.LastUpdated = DateTime.UtcNow;

                await _context.SaveChangesAsync();
            }
        }

        private (int Level, int ExperiencePoints, int NextLevelPoints) CalculateUserLevel(int totalPoints)
        {
            var levels = new[]
            {
                new { Level = 1, MinPoints = 0 },
                new { Level = 2, MinPoints = 100 },
                new { Level = 3, MinPoints = 300 },
                new { Level = 4, MinPoints = 600 },
                new { Level = 5, MinPoints = 1000 },
                new { Level = 6, MinPoints = 1500 },
                new { Level = 7, MinPoints = 2200 },
                new { Level = 8, MinPoints = 3000 }
            };

            var currentLevel = levels.LastOrDefault(l => totalPoints >= l.MinPoints) ?? levels[0];
            var nextLevel = levels.FirstOrDefault(l => l.Level > currentLevel.Level);

            var experiencePoints = totalPoints - currentLevel.MinPoints;
            var nextLevelPoints = nextLevel != null ? nextLevel.MinPoints - currentLevel.MinPoints : 0;

            return (currentLevel.Level, experiencePoints, nextLevelPoints);
        }


        public async System.Threading.Tasks.Task TrackEventAsync(int userId, CreateAchievementEventDto eventDto)
        {
            var achievementEvent = new AchievementEvent
            {
                UserId = userId,
                EventType = eventDto.Type,
                EventData = eventDto.Data,
                Timestamp = DateTime.UtcNow
            };

            _context.AchievementEvents.Add(achievementEvent);
            await _context.SaveChangesAsync();

            try
            {
                await ProcessSingleEvent(userId, achievementEvent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing achievement event {eventDto.Type} for user {userId}");
            }
        }

        private async System.Threading.Tasks.Task ProcessSingleEvent(int userId, AchievementEvent evt)
        {
            if (evt.IsProcessed)
            {
                return;
            }

            var achievements = await _context.Achievements
                .Include(a => a.Tiers)
                .ToListAsync();

            var affectedAchievements = GetAchievementsForEvent(achievements, evt.EventType);

            if (!affectedAchievements.Any())
            {
                evt.IsProcessed = true;
                return;
            }

            if (evt.EventType?.ToUpperInvariant() == "DAILY_LOGIN")
            {
                await UpdateStreakAsync(userId, evt.Timestamp);
            }

            foreach (var achievement in affectedAchievements)
            {
                var progress = await _context.UserAchievementProgress
                    .Include(uap => uap.TierProgress)
                    .ThenInclude(tp => tp.AchievementTier)
                    .FirstOrDefaultAsync(uap => uap.UserId == userId && uap.AchievementId == achievement.Id);

                if (progress == null)
                {
                    progress = new UserAchievementProgress
                    {
                        UserId = userId,
                        AchievementId = achievement.Id,
                        CurrentValue = 0,
                        LastUpdated = DateTime.UtcNow
                    };
                    _context.UserAchievementProgress.Add(progress);
                    await _context.SaveChangesAsync();
                }

                progress.CurrentValue++;
                progress.LastUpdated = DateTime.UtcNow;

                var orderedTiers = achievement.Tiers.OrderBy(t => t.Target).ToList();
                foreach (var tier in orderedTiers)
                {
                    if (progress.CurrentValue >= tier.Target)
                    {
                        var tierProgress = progress.TierProgress
                            .FirstOrDefault(tp => tp.AchievementTierId == tier.Id);

                        if (tierProgress == null || !tierProgress.IsUnlocked)
                        {
                            if (tierProgress == null)
                            {
                                tierProgress = new UserAchievementTierProgress
                                {
                                    UserAchievementProgressId = progress.Id,
                                    AchievementTierId = tier.Id,
                                    IsUnlocked = true,
                                    UnlockedAt = DateTime.UtcNow
                                };
                                progress.TierProgress.Add(tierProgress);
                            }
                            else
                            {
                                tierProgress.IsUnlocked = true;
                                tierProgress.UnlockedAt = DateTime.UtcNow;
                            }

                            if (progress.FirstUnlockedAt == null)
                            {
                                progress.FirstUnlockedAt = DateTime.UtcNow;
                            }
                        }
                    }
                }
            }
            evt.IsProcessed = true;

            await _context.SaveChangesAsync();
            await UpdateUserStatsAsync(userId);
        }

        private async System.Threading.Tasks.Task UpdateStreakAsync(int userId, DateTime eventDate)
        {
            var stats = await _context.UserAchievementStats
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (stats == null)
            {
                return;
            }

            var today = eventDate.Date;
            var lastStreakDate = stats.LastStreakDate?.Date;

            if (lastStreakDate == null)
            {
                stats.CurrentStreak = 1;
                stats.LongestStreak = 1;
                stats.LastStreakDate = today;
            }
            else if (lastStreakDate == today)
            {
                return;
            }
            else if (lastStreakDate == today.AddDays(-1))
            {
                stats.CurrentStreak++;
                stats.LastStreakDate = today;

                if (stats.CurrentStreak > stats.LongestStreak)
                {
                    stats.LongestStreak = stats.CurrentStreak;
                }
            }
            else
            {
                stats.CurrentStreak = 1;
                stats.LastStreakDate = today;
            }

            stats.LastUpdated = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }


        public async System.Threading.Tasks.Task<List<AchievementNotificationDto>> ProcessAchievementEvents(int userId)
        {
            var notifications = new List<AchievementNotificationDto>();

            var events = await _context.AchievementEvents
                .Where(e => e.UserId == userId && !e.IsProcessed)
                .OrderByDescending(e => e.Timestamp)
                .Take(100)
                .ToListAsync();

            if (!events.Any())
            {
                return notifications;
            }

            var achievements = await _context.Achievements
                .Include(a => a.Tiers)
                .ToListAsync();

            var userProgress = await _context.UserAchievementProgress
                .Include(uap => uap.TierProgress)
                .ThenInclude(tp => tp.AchievementTier)
                .Where(uap => uap.UserId == userId)
                .ToDictionaryAsync(uap => uap.AchievementId);

            foreach (var evt in events)
            {
                var affectedAchievements = GetAchievementsForEvent(achievements, evt.EventType);

                foreach (var achievement in affectedAchievements)
                {
                    if (!userProgress.TryGetValue(achievement.Id, out var progress))
                    {
                        progress = new UserAchievementProgress
                        {
                            UserId = userId,
                            AchievementId = achievement.Id,
                            CurrentValue = 0,
                            LastUpdated = DateTime.UtcNow
                        };
                        _context.UserAchievementProgress.Add(progress);
                        await _context.SaveChangesAsync();
                        userProgress[achievement.Id] = progress;
                    }

                    var oldValue = progress.CurrentValue;
                    progress.CurrentValue++;
                    progress.LastUpdated = DateTime.UtcNow;
                    _logger.LogInformation($"Achievement {achievement.Id}: {oldValue} -> {progress.CurrentValue}");

                    var orderedTiers = achievement.Tiers.OrderBy(t => t.Target).ToList();
                    foreach (var tier in orderedTiers)
                    {
                        if (progress.CurrentValue >= tier.Target)
                        {
                            var tierProgress = progress.TierProgress
                                .FirstOrDefault(tp => tp.AchievementTierId == tier.Id);

                            if (tierProgress == null || !tierProgress.IsUnlocked)
                            {
                                if (tierProgress == null)
                                {
                                    tierProgress = new UserAchievementTierProgress
                                    {
                                        UserAchievementProgressId = progress.Id,
                                        AchievementTierId = tier.Id,
                                        IsUnlocked = true,
                                        UnlockedAt = DateTime.UtcNow
                                    };
                                    progress.TierProgress.Add(tierProgress);
                                }
                                else
                                {
                                    tierProgress.IsUnlocked = true;
                                    tierProgress.UnlockedAt = DateTime.UtcNow;
                                }

                                if (progress.FirstUnlockedAt == null)
                                {
                                    progress.FirstUnlockedAt = DateTime.UtcNow;
                                }

                                notifications.Add(new AchievementNotificationDto
                                {
                                    Achievement = new AchievementDto
                                    {
                                        Id = achievement.Id,
                                        Key = achievement.Key,
                                        Category = achievement.Category,
                                        Type = achievement.Type,
                                        Icon = achievement.Icon,
                                        Color = achievement.Color,
                                        IsHidden = achievement.IsHidden
                                    },
                                    Tier = new AchievementTierDto
                                    {
                                        Id = tier.Id,
                                        Level = tier.Level,
                                        Target = tier.Target,
                                        Points = tier.Points,
                                        Unlocked = true,
                                        UnlockedAt = DateTime.UtcNow
                                    },
                                    IsNewAchievement = progress.FirstUnlockedAt == DateTime.UtcNow
                                });

                                _logger.LogInformation($"User {userId} unlocked {achievement.Key} - {tier.Level} tier");
                            }
                        }
                    }
                }
                evt.IsProcessed = true;
            }

            await _context.SaveChangesAsync();
            await UpdateUserStatsAsync(userId);

            return notifications;
        }

        private List<Achievement> GetAchievementsForEvent(List<Achievement> achievements, string eventType)
        {
            return eventType?.ToUpperInvariant() switch
            {
                "TASK_COMPLETED" => achievements.Where(a => a.Id == "task_completionist").ToList(),
                "TASK_CREATED" => achievements.Where(a => a.Id is "first_steps" or "multitasker").ToList(),
                "CATEGORY_CREATED" => achievements.Where(a => a.Id == "category_creator").ToList(),
                "ALL_TASKS_COMPLETED_TODAY" => achievements.Where(a => a.Id == "daily_achiever").ToList(),
                "TASK_COMPLETED_ON_TIME" => achievements.Where(a => a.Id is "speed_demon" or "time_master").ToList(),
                "TASK_COMPLETED_LATE" => achievements.Where(a => a.Id == "none").ToList(),
                "TASK_UPDATED" => achievements.Where(a => a.Id == "none").ToList(),
                "EARLY_BIRD" => achievements.Where(a => a.Id == "early_bird").ToList(),
                "NIGHT_OWL" => achievements.Where(a => a.Id == "night_owl").ToList(),
                "WEEKEND_PRODUCTIVITY" => achievements.Where(a => a.Id == "weekend_warrior").ToList(),
                "DAILY_LOGIN" => achievements.Where(a => a.Id == "consistency_keeper").ToList(),
                "CALENDAR_VIEWED" or "CALENDAR_VIEW_USED" => achievements.Where(a => a.Id == "calendar_master").ToList(),
                "DASHBOARD_VIEWED" => achievements.Where(a => a.Id == "feature_explorer").ToList(),
                "APP_OPENED" => achievements.Where(a => a.Id == "feature_explorer").ToList(),
                _ => []
            };
        }
    }
}