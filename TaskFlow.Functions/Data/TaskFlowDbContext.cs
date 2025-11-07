using Microsoft.EntityFrameworkCore;
using TaskFlow.Functions.Models;

namespace TaskFlow.Functions.Data
{
    public class TaskFlowDbContext : DbContext
    {
        public TaskFlowDbContext(DbContextOptions<TaskFlowDbContext> options) : base(options)
        {
        }

        public DbSet<TaskItem> Tasks { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("Users");

            modelBuilder.Entity<TaskItem>()
                .ToTable("Tasks")
                .HasOne(t => t.User)
                .WithMany(u => u.Tasks)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TaskItem>()
                .Property(t => t.CreatedAt)
                .HasColumnType("datetime2");

            base.OnModelCreating(modelBuilder);
        }
    }
}
