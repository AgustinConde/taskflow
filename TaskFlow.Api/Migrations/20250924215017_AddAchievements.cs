using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskFlow.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAchievements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AchievementEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EventData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AchievementEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AchievementEvents_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Achievements",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsHidden = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Achievements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserAchievementStats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    TotalPoints = table.Column<int>(type: "int", nullable: false),
                    TotalAchievements = table.Column<int>(type: "int", nullable: false),
                    UnlockedAchievements = table.Column<int>(type: "int", nullable: false),
                    CurrentStreak = table.Column<int>(type: "int", nullable: false),
                    LongestStreak = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    ExperiencePoints = table.Column<int>(type: "int", nullable: false),
                    NextLevelPoints = table.Column<int>(type: "int", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAchievementStats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAchievementStats_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AchievementTiers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AchievementId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Target = table.Column<int>(type: "int", nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AchievementTiers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AchievementTiers_Achievements_AchievementId",
                        column: x => x.AchievementId,
                        principalTable: "Achievements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAchievementProgress",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    AchievementId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CurrentValue = table.Column<int>(type: "int", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FirstUnlockedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAchievementProgress", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAchievementProgress_Achievements_AchievementId",
                        column: x => x.AchievementId,
                        principalTable: "Achievements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserAchievementProgress_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAchievementTierProgress",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserAchievementProgressId = table.Column<int>(type: "int", nullable: false),
                    AchievementTierId = table.Column<int>(type: "int", nullable: false),
                    IsUnlocked = table.Column<bool>(type: "bit", nullable: false),
                    UnlockedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAchievementTierProgress", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAchievementTierProgress_AchievementTiers_AchievementTierId",
                        column: x => x.AchievementTierId,
                        principalTable: "AchievementTiers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserAchievementTierProgress_UserAchievementProgress_UserAchievementProgressId",
                        column: x => x.UserAchievementProgressId,
                        principalTable: "UserAchievementProgress",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AchievementEvents_EventType",
                table: "AchievementEvents",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_AchievementEvents_UserId_Timestamp",
                table: "AchievementEvents",
                columns: new[] { "UserId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_AchievementTiers_AchievementId",
                table: "AchievementTiers",
                column: "AchievementId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAchievementProgress_AchievementId",
                table: "UserAchievementProgress",
                column: "AchievementId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAchievementProgress_UserId_AchievementId",
                table: "UserAchievementProgress",
                columns: new[] { "UserId", "AchievementId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserAchievementStats_UserId",
                table: "UserAchievementStats",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAchievementTierProgress_AchievementTierId",
                table: "UserAchievementTierProgress",
                column: "AchievementTierId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAchievementTierProgress_UserAchievementProgressId",
                table: "UserAchievementTierProgress",
                column: "UserAchievementProgressId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AchievementEvents");

            migrationBuilder.DropTable(
                name: "UserAchievementStats");

            migrationBuilder.DropTable(
                name: "UserAchievementTierProgress");

            migrationBuilder.DropTable(
                name: "AchievementTiers");

            migrationBuilder.DropTable(
                name: "UserAchievementProgress");

            migrationBuilder.DropTable(
                name: "Achievements");
        }
    }
}
