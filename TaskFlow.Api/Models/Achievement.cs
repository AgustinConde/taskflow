using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlow.Api.Models
{
    public class Achievement
    {
        [Key]
        public string Id { get; set; } = "";

        [Required]
        public string Key { get; set; } = "";

        [Required]
        public string Category { get; set; } = "";

        [Required]
        public string Type { get; set; } = "";

        [Required]
        public string Icon { get; set; } = "";

        public string Color { get; set; } = "";

        public bool IsHidden { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<AchievementTier> Tiers { get; set; } = new List<AchievementTier>();
        public virtual ICollection<UserAchievementProgress> UserProgress { get; set; } = new List<UserAchievementProgress>();
    }

    public class AchievementTier
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string AchievementId { get; set; } = "";

        [Required]
        public string Level { get; set; } = ""; // bronze, silver, gold, diamond

        public int Target { get; set; }

        public int Points { get; set; }

        public int SortOrder { get; set; }

        public virtual Achievement Achievement { get; set; } = null!;
        public virtual ICollection<UserAchievementTierProgress> UserTierProgress { get; set; } = new List<UserAchievementTierProgress>();
    }

    public class UserAchievementProgress
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string AchievementId { get; set; } = "";

        public int CurrentValue { get; set; } = 0;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public DateTime? FirstUnlockedAt { get; set; }

        public virtual User User { get; set; } = null!;
        public virtual Achievement Achievement { get; set; } = null!;
        public virtual ICollection<UserAchievementTierProgress> TierProgress { get; set; } = new List<UserAchievementTierProgress>();
    }

    public class UserAchievementTierProgress
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserAchievementProgressId { get; set; }

        [Required]
        public int AchievementTierId { get; set; }

        public bool IsUnlocked { get; set; } = false;

        public DateTime? UnlockedAt { get; set; }

        public virtual UserAchievementProgress UserAchievementProgress { get; set; } = null!;
        public virtual AchievementTier AchievementTier { get; set; } = null!;
    }
    public class AchievementEvent
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string EventType { get; set; } = "";

        public string? EventData { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public bool IsProcessed { get; set; } = false;

        public virtual User User { get; set; } = null!;
    }

    public class UserAchievementStats
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        public int TotalPoints { get; set; } = 0;

        public int TotalAchievements { get; set; } = 0;

        public int UnlockedAchievements { get; set; } = 0;

        public int CurrentStreak { get; set; } = 0;

        public int LongestStreak { get; set; } = 0;

        public DateTime? LastStreakDate { get; set; } = null;

        public int Level { get; set; } = 1;

        public int ExperiencePoints { get; set; } = 0;

        public int NextLevelPoints { get; set; } = 100;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public virtual User User { get; set; } = null!;
    }
}