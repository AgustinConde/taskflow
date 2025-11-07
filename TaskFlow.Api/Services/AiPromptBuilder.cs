using System.Linq;
using System.Text;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Models;

namespace TaskFlow.Api.Services;

internal static class AiPromptBuilder
{
    public static string BuildContextualPrompt(
        string systemPrompt,
        UserContext? userContext,
        List<ChatMessageDto>? conversationHistory,
        string currentMessage,
        string language)
    {
        var promptBuilder = new StringBuilder();

        promptBuilder.AppendLine(systemPrompt);
        promptBuilder.AppendLine();

        if (userContext != null)
        {
            promptBuilder.AppendLine("## User Context:");
            promptBuilder.AppendLine($"Username: {userContext.Username}");
            promptBuilder.AppendLine();

            if (userContext.Tasks.Count != 0)
            {
                var pendingTasks = userContext.Tasks.Where(t => !t.IsCompleted).ToList();
                var completedTasks = userContext.Tasks.Where(t => t.IsCompleted).ToList();

                promptBuilder.AppendLine($"### Tasks ({pendingTasks.Count} pending, {completedTasks.Count} completed):");

                if (pendingTasks.Count != 0)
                {
                    promptBuilder.AppendLine("**Pending:**");
                    foreach (var task in pendingTasks.Take(3))
                    {
                        promptBuilder.AppendLine($"- {task.Title}" +
                            (task.DueDate.HasValue ? $" (Due: {task.DueDate:yyyy-MM-dd})" : string.Empty));
                    }
                }

                if (completedTasks.Count != 0)
                {
                    promptBuilder.AppendLine($"**Recently Completed:** {completedTasks.Count} tasks");
                }

                promptBuilder.AppendLine();
            }

            if (userContext.Categories.Count != 0)
            {
                promptBuilder.AppendLine("### Categories:");
                foreach (var category in userContext.Categories)
                {
                    promptBuilder.AppendLine($"- {category.Name} ({category.TaskCount} tasks)");
                }

                promptBuilder.AppendLine();
            }

            if (userContext.Achievements != null)
            {
                promptBuilder.AppendLine($"### Stats: Level {userContext.Achievements.Level}, {userContext.Achievements.TotalPoints} points, {userContext.Achievements.CurrentStreak}-day streak");
                promptBuilder.AppendLine();
            }
        }

        if (conversationHistory != null && conversationHistory.Count != 0)
        {
            promptBuilder.AppendLine("## Recent Chat:");
            foreach (var msg in conversationHistory.TakeLast(3))
            {
                promptBuilder.AppendLine($"{msg.Role.ToUpper()}: {msg.Content}");
            }

            promptBuilder.AppendLine();
        }

        promptBuilder.AppendLine("## Current Message:");
        promptBuilder.AppendLine($"USER: {currentMessage}");
        promptBuilder.AppendLine();

        var languageInstruction = language == "es"
            ? "**IMPORTANTE: Tu respuesta COMPLETA debe estar en ESPAÑOL. No uses ni una sola palabra en inglés.**"
            : "**IMPORTANT: Your ENTIRE response must be in ENGLISH. Do not use any Spanish words.**";

        promptBuilder.AppendLine(languageInstruction);
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("ASSISTANT:");

        return promptBuilder.ToString();
    }
}
