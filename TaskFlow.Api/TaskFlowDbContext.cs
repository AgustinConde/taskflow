using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Models;

namespace TaskFlow.Api
{
    public class TaskFlowDbContext(DbContextOptions<TaskFlowDbContext> options) : DbContext(options)
    {
        public DbSet<TaskFlow.Api.Models.Task> Tasks { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<UserToken> UserTokens { get; set; }
        public DbSet<Achievement> Achievements { get; set; }
        public DbSet<AchievementTier> AchievementTiers { get; set; }
        public DbSet<UserAchievementProgress> UserAchievementProgress { get; set; }
        public DbSet<UserAchievementTierProgress> UserAchievementTierProgress { get; set; }
        public DbSet<AchievementEvent> AchievementEvents { get; set; }
        public DbSet<UserAchievementStats> UserAchievementStats { get; set; }
        public DbSet<Location> Locations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TaskFlow.Api.Models.Task>()
                .HasOne(t => t.User)
                .WithMany(u => u.Tasks)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TaskFlow.Api.Models.Task>()
                .HasOne(t => t.Category)
                .WithMany(c => c.Tasks)
                .HasForeignKey(t => t.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<TaskFlow.Api.Models.Task>()
                .HasOne(t => t.Location)
                .WithMany(l => l.Tasks)
                .HasForeignKey(t => t.LocationId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Location>()
                .Property(l => l.PlaceId)
                .HasMaxLength(500);

            modelBuilder.Entity<Location>()
                .Property(l => l.PlaceName)
                .HasMaxLength(200);

            modelBuilder.Entity<Location>()
                .Property(l => l.Address)
                .HasMaxLength(500)
                .IsRequired();

            modelBuilder.Entity<Category>()
                .HasOne(c => c.User)
                .WithMany(u => u.Categories)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<AchievementTier>()
                .HasOne(at => at.Achievement)
                .WithMany(a => a.Tiers)
                .HasForeignKey(at => at.AchievementId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserAchievementProgress>()
                .HasOne(uap => uap.User)
                .WithMany()
                .HasForeignKey(uap => uap.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserAchievementProgress>()
                .HasOne(uap => uap.Achievement)
                .WithMany(a => a.UserProgress)
                .HasForeignKey(uap => uap.AchievementId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserAchievementTierProgress>()
                .HasOne(uatp => uatp.UserAchievementProgress)
                .WithMany(uap => uap.TierProgress)
                .HasForeignKey(uatp => uatp.UserAchievementProgressId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserAchievementTierProgress>()
                .HasOne(uatp => uatp.AchievementTier)
                .WithMany(at => at.UserTierProgress)
                .HasForeignKey(uatp => uatp.AchievementTierId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<AchievementEvent>()
                .HasOne(ae => ae.User)
                .WithMany()
                .HasForeignKey(ae => ae.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserAchievementStats>()
                .HasOne(uas => uas.User)
                .WithMany()
                .HasForeignKey(uas => uas.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserAchievementProgress>()
                .HasIndex(uap => new { uap.UserId, uap.AchievementId })
                .IsUnique();

            modelBuilder.Entity<AchievementEvent>()
                .HasIndex(ae => new { ae.UserId, ae.Timestamp });

            modelBuilder.Entity<AchievementEvent>()
                .HasIndex(ae => ae.EventType);

            base.OnModelCreating(modelBuilder);
        }
    }
}