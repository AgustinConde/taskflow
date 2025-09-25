namespace TaskFlow.Api.DTOs
{
    public class AchievementDto
    {
        public string Id { get; set; } = "";
        public string Key { get; set; } = "";
        public string Category { get; set; } = "";
        public string Type { get; set; } = "";
        public string Icon { get; set; } = "";
        public string Color { get; set; } = "";
        public bool IsHidden { get; set; }
        public List<AchievementTierDto> Tiers { get; set; } = new List<AchievementTierDto>();
    }

    public class AchievementTierDto
    {
        public int Id { get; set; }
        public string Level { get; set; } = "";
        public int Target { get; set; }
        public int Points { get; set; }
        public bool Unlocked { get; set; }
        public DateTime? UnlockedAt { get; set; }
    }

    public class UserAchievementProgressDto
    {
        public string AchievementId { get; set; } = "";
        public int CurrentValue { get; set; }
        public List<string> UnlockedTiers { get; set; } = new List<string>();
        public DateTime LastUpdated { get; set; }
        public DateTime? FirstUnlockedAt { get; set; }
    }

    public class UpdateAchievementProgressDto
    {
        public string AchievementId { get; set; } = "";
        public int CurrentValue { get; set; }
        public List<string> UnlockedTiers { get; set; } = new List<string>();
    }

    public class AchievementEventDto
    {
        public string Type { get; set; } = "";
        public object? Data { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class CreateAchievementEventDto
    {
        public string Type { get; set; } = "";
        public string? Data { get; set; }
    }

    public class UserAchievementStatsDto
    {
        public int TotalPoints { get; set; }
        public int TotalAchievements { get; set; }
        public int UnlockedAchievements { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public int Level { get; set; }
        public int ExperiencePoints { get; set; }
        public int NextLevelPoints { get; set; }
    }

    public class AchievementNotificationDto
    {
        public AchievementDto Achievement { get; set; } = new AchievementDto();
        public AchievementTierDto Tier { get; set; } = new AchievementTierDto();
        public bool IsNewAchievement { get; set; }
    }
    public class AchievementSummaryDto
    {
        public int TotalAchievements { get; set; }
        public int UnlockedAchievements { get; set; }
        public int TotalPoints { get; set; }
        public int CurrentLevel { get; set; }
        public List<AchievementCategoryStatsDto> CategoryStats { get; set; } = new List<AchievementCategoryStatsDto>();
    }

    public class AchievementCategoryStatsDto
    {
        public string Category { get; set; } = "";
        public int Total { get; set; }
        public int Unlocked { get; set; }
        public decimal Percentage { get; set; }
    }
}