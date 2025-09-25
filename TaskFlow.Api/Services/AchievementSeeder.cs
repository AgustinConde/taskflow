using TaskFlow.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace TaskFlow.Api.Services
{
    public static class AchievementSeeder
    {
        public static async System.Threading.Tasks.Task SeedAchievementsAsync(TaskFlowDbContext context)
        {
            if (await context.Achievements.AnyAsync())
            {
                return; // Already seeded
            }

            var achievements = new List<Achievement>
            {
                // === PRODUCTIVITY ACHIEVEMENTS ===
                new() {
                    Id = "task_completionist",
                    Key = "achievements.taskCompletionist",
                    Category = "productivity",
                    Type = "counter",
                    Icon = "CheckCircle",
                    Color = "#4CAF50",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 5, Points = 10, SortOrder = 1 },
                        new() { Level = "silver", Target = 25, Points = 25, SortOrder = 2 },
                        new() { Level = "gold", Target = 100, Points = 50, SortOrder = 3 },
                        new() { Level = "diamond", Target = 500, Points = 100, SortOrder = 4 }
                    ]
                },
                new() {
                    Id = "daily_achiever",
                    Key = "achievements.dailyAchiever",
                    Category = "productivity",
                    Type = "counter",
                    Icon = "Today",
                    Color = "#FF9800",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 1, Points = 15, SortOrder = 1 },
                        new() { Level = "silver", Target = 7, Points = 30, SortOrder = 2 },
                        new() { Level = "gold", Target = 30, Points = 75, SortOrder = 3 },
                        new() { Level = "diamond", Target = 100, Points = 150, SortOrder = 4 }
                    ]
                },
                new() {
                    Id = "speed_demon",
                    Key = "achievements.speedDemon",
                    Category = "productivity",
                    Type = "counter",
                    Icon = "Speed",
                    Color = "#E91E63",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 5, Points = 20, SortOrder = 1 },
                        new() { Level = "silver", Target = 20, Points = 40, SortOrder = 2 },
                        new() { Level = "gold", Target = 50, Points = 80, SortOrder = 3 },
                        new() { Level = "diamond", Target = 150, Points = 160, SortOrder = 4 }
                    ]
                },

                // === ORGANIZATION ACHIEVEMENTS ===
                new() {
                    Id = "category_creator",
                    Key = "achievements.categoryCreator",
                    Category = "organization",
                    Type = "counter",
                    Icon = "Category",
                    Color = "#9C27B0",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 3, Points = 15, SortOrder = 1 },
                        new() { Level = "silver", Target = 10, Points = 30, SortOrder = 2 },
                        new() { Level = "gold", Target = 25, Points = 60, SortOrder = 3 },
                        new() { Level = "diamond", Target = 50, Points = 120, SortOrder = 4 }
                    ]
                },
                new() {
                    Id = "organizer_supreme",
                    Key = "achievements.organizerSupreme",
                    Category = "organization",
                    Type = "milestone",
                    Icon = "FolderSpecial",
                    Color = "#673AB7",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "gold", Target = 1, Points = 100, SortOrder = 1 }
                    ]
                },

                // === CONSISTENCY ACHIEVEMENTS ===
                new() {
                    Id = "consistency_keeper",
                    Key = "achievements.consistencyKeeper",
                    Category = "consistency",
                    Type = "streak",
                    Icon = "Whatshot",
                    Color = "#FF5722",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 3, Points = 25, SortOrder = 1 },
                        new() { Level = "silver", Target = 7, Points = 50, SortOrder = 2 },
                        new() { Level = "gold", Target = 21, Points = 100, SortOrder = 3 },
                        new() { Level = "diamond", Target = 60, Points = 250, SortOrder = 4 }
                    ]
                },
                new() {
                    Id = "weekend_warrior",
                    Key = "achievements.weekendWarrior",
                    Category = "consistency",
                    Type = "counter",
                    Icon = "Weekend",
                    Color = "#795548",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 2, Points = 20, SortOrder = 1 },
                        new() { Level = "silver", Target = 8, Points = 40, SortOrder = 2 },
                        new() { Level = "gold", Target = 20, Points = 80, SortOrder = 3 },
                        new() { Level = "diamond", Target = 52, Points = 160, SortOrder = 4 }
                    ]
                },

                // === EXPLORATION ACHIEVEMENTS ===
                new() {
                    Id = "feature_explorer",
                    Key = "achievements.featureExplorer",
                    Category = "exploration",
                    Type = "milestone",
                    Icon = "Explore",
                    Color = "#2196F3",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 1, Points = 30, SortOrder = 1 }
                    ]
                },
                new() {
                    Id = "calendar_master",
                    Key = "achievements.calendarMaster",
                    Category = "exploration",
                    Type = "counter",
                    Icon = "CalendarToday",
                    Color = "#00BCD4",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 5, Points = 15, SortOrder = 1 },
                        new() { Level = "silver", Target = 25, Points = 35, SortOrder = 2 },
                        new() { Level = "gold", Target = 100, Points = 70, SortOrder = 3 }
                    ]
                },

                // === MASTERY ACHIEVEMENTS ===
                new() {
                    Id = "early_bird",
                    Key = "achievements.earlyBird",
                    Category = "mastery",
                    Type = "counter",
                    Icon = "WbSunny",
                    Color = "#FFC107",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 5, Points = 20, SortOrder = 1 },
                        new() { Level = "silver", Target = 15, Points = 40, SortOrder = 2 },
                        new() { Level = "gold", Target = 50, Points = 80, SortOrder = 3 }
                    ]
                },
                new() {
                    Id = "night_owl",
                    Key = "achievements.nightOwl",
                    Category = "mastery",
                    Type = "counter",
                    Icon = "NightsStay",
                    Color = "#3F51B5",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 5, Points = 20, SortOrder = 1 },
                        new() { Level = "silver", Target = 15, Points = 40, SortOrder = 2 },
                        new() { Level = "gold", Target = 50, Points = 80, SortOrder = 3 }
                    ]
                },
                new() {
                    Id = "perfectionist",
                    Key = "achievements.perfectionist",
                    Category = "mastery",
                    Type = "milestone",
                    Icon = "Stars",
                    Color = "#E91E63",
                    IsHidden = true, // Hidden until discovered
                    Tiers =
                    [
                        new() { Level = "gold", Target = 1, Points = 150, SortOrder = 1 }
                    ]
                },

                // === SPECIAL ACHIEVEMENTS ===
                new() {
                    Id = "first_steps",
                    Key = "achievements.firstSteps",
                    Category = "exploration",
                    Type = "milestone",
                    Icon = "EmojiEvents",
                    Color = "#4CAF50",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 1, Points = 5, SortOrder = 1 }
                    ]
                },
                new() {
                    Id = "multitasker",
                    Key = "achievements.multitasker",
                    Category = "productivity",
                    Type = "counter",
                    Icon = "DynamicFeed",
                    Color = "#607D8B",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 10, Points = 25, SortOrder = 1 },
                        new() { Level = "silver", Target = 50, Points = 50, SortOrder = 2 },
                        new() { Level = "gold", Target = 200, Points = 100, SortOrder = 3 }
                    ]
                },
                new() {
                    Id = "time_master",
                    Key = "achievements.timeMaster",
                    Category = "mastery",
                    Type = "counter",
                    Icon = "Schedule",
                    Color = "#FF6B6B",
                    IsHidden = false,
                    Tiers =
                    [
                        new() { Level = "bronze", Target = 10, Points = 30, SortOrder = 1 },
                        new() { Level = "silver", Target = 50, Points = 60, SortOrder = 2 },
                        new() { Level = "gold", Target = 200, Points = 120, SortOrder = 3 }
                    ]
                }
            };

            foreach (var achievement in achievements)
            {
                foreach (var tier in achievement.Tiers)
                {
                    tier.AchievementId = achievement.Id;
                }
            }

            context.Achievements.AddRange(achievements);
            await context.SaveChangesAsync();
        }
    }
}