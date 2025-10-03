using TaskFlow.Api.DTOs;
using TaskFlow.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace TaskFlow.Api.Services
{
    public class AIAssistantService(
        IAIProvider aiProvider,
        TaskFlowDbContext context,
        ILogger<AIAssistantService> logger)
    {
        private readonly IAIProvider _aiProvider = aiProvider;
        private readonly TaskFlowDbContext _context = context;
        private readonly ILogger<AIAssistantService> _logger = logger;

        private const string SYSTEM_PROMPT = @"You are TaskFlow Assistant, a helpful AI designed to assist users with task management ONLY.

**STRICT RULES - YOU MUST FOLLOW THESE:**
1. You can ONLY help with topics related to TaskFlow: task management, productivity, organization, time management, goal setting, and task prioritization.
2. If the user asks about ANYTHING else (sports, cooking, history, math, science, entertainment, etc.), you MUST politely decline and redirect them to TaskFlow topics.
3. Use the user's context (their tasks, categories, achievements) to provide personalized suggestions.
4. Be concise and actionable - users want quick, practical advice.
5. When suggesting tasks, be specific and realistic.
6. **CRITICAL: Respond ENTIRELY in the same language as the user's message. If they write in Spanish, your ENTIRE response must be in Spanish. If in English, ENTIRE response in English. Do NOT mix languages.**
7. Never make up or hallucinate information about the user's data - only use what's provided in the context.
8. If you don't have enough context to answer, ask clarifying questions about their tasks or goals IN THE SAME LANGUAGE.

**Examples of ALLOWED topics:**
- ""Sugiere nuevas tareas para esta semana""
- ""¿Cómo organizo mis tareas por prioridad?""
- ""Help me create a study schedule""
- ""What categories should I create for work tasks?""
- ""I'm feeling overwhelmed, how can I organize better?""

**Examples of FORBIDDEN topics (you must decline):**
- ""¿Cuánto es 2+2?"" → DECLINE: ""Lo siento, solo puedo ayudarte con la gestión de tareas en TaskFlow""
- ""Tell me a joke"" → DECLINE: ""I can only assist with task management""
- ""What's the capital of France?"" → DECLINE: ""That's outside my scope - I focus on helping you manage tasks""
- ""Write me a poem"" → DECLINE: ""I'm specialized in task organization, not creative writing""

Remember: Stay focused on TaskFlow and task management ONLY. Respond ENTIRELY in the user's language. If in doubt, decline politely.";

        public async Task<ChatResponseDto> SendMessageAsync(ChatRequestDto request, int userId, string language = "es")
        {
            try
            {
                if (!await _aiProvider.IsAvailableAsync())
                {
                    _logger.LogWarning("AI Provider {Provider} is not available", _aiProvider.ProviderName);
                    var errorMessage = language == "es"
                        ? "Lo siento, el servicio de IA no está disponible actualmente. Por favor, asegúrate de que Ollama esté ejecutándose."
                        : "Sorry, the AI service is currently unavailable. Please make sure Ollama is running.";
                    return new ChatResponseDto
                    {
                        Message = errorMessage,
                        IsRestricted = false
                    };
                }

                UserContext? userContext = null;
                if (request.IncludeTaskContext || request.IncludeCategoryContext || request.IncludeAchievementContext)
                {
                    userContext = await BuildUserContextAsync(userId, request);
                }

                var response = await _aiProvider.SendChatMessageAsync(
                    request.Message,
                    request.ConversationHistory,
                    userContext,
                    SYSTEM_PROMPT,
                    language
                );

                var (suggestedAction, actionData) = AnalyzeResponseForActions(response);

                return new ChatResponseDto
                {
                    Message = response,
                    Timestamp = DateTime.UtcNow,
                    IsRestricted = false,
                    SuggestedAction = suggestedAction,
                    ActionData = actionData
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing AI chat message for user {UserId}", userId);
                var errorMessage = language == "es"
                    ? "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo."
                    : "Sorry, there was an error processing your message. Please try again.";
                return new ChatResponseDto
                {
                    Message = errorMessage,
                    IsRestricted = false
                };
            }
        }

        private async Task<UserContext> BuildUserContextAsync(int userId, ChatRequestDto request)
        {
            var user = await _context.Users.FindAsync(userId);
            var userContext = new UserContext
            {
                UserId = userId,
                Username = user?.Username ?? "User"
            };

            if (request.IncludeTaskContext)
            {
                var tasks = await _context.Tasks
                    .Include(t => t.Category)
                    .Where(t => t.UserId == userId)
                    .OrderByDescending(t => t.CreatedAt)
                    .Take(5)
                    .Select(t => new TaskSummary
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Description = null,
                        IsCompleted = t.IsCompleted,
                        DueDate = t.DueDate,
                        CategoryName = t.Category != null ? t.Category.Name : null,
                        HasLocation = false
                    })
                    .ToListAsync();

                userContext.Tasks = tasks;
            }

            if (request.IncludeCategoryContext)
            {
                var categories = await _context.Categories
                    .Where(c => c.UserId == userId)
                    .Select(c => new CategorySummary
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Color = c.Color,
                        TaskCount = c.Tasks.Count
                    })
                    .ToListAsync();

                userContext.Categories = categories;
            }

            if (request.IncludeAchievementContext)
            {
                try
                {
                    var stats = await _context.UserAchievementStats
                        .FirstOrDefaultAsync(s => s.UserId == userId);

                    if (stats != null)
                    {
                        var completedLast30Days = await _context.Tasks
                            .Where(t => t.UserId == userId &&
                                       t.IsCompleted &&
                                       t.CreatedAt >= DateTime.UtcNow.AddDays(-30))
                            .CountAsync();

                        userContext.Achievements = new AchievementStats
                        {
                            TotalPoints = stats.TotalPoints,
                            Level = stats.Level,
                            CurrentStreak = stats.CurrentStreak,
                            CompletedTasksLast30Days = completedLast30Days
                        };
                    }
                    else
                    {
                        _logger.LogWarning("UserAchievementStats not found for user {UserId}", userId);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error loading achievement stats for user {UserId}", userId);
                }
            }

            return userContext;
        }

        private static (string? suggestedAction, object? actionData) AnalyzeResponseForActions(string response)
        {
            var lowerResponse = response.ToLower();

            if (lowerResponse.Contains("crear") && lowerResponse.Contains("tarea") ||
                lowerResponse.Contains("create") && lowerResponse.Contains("task") ||
                lowerResponse.Contains("agregar") && lowerResponse.Contains("tarea"))
            {
                return ("create_task", null);
            }

            if (lowerResponse.Contains("organizar") || lowerResponse.Contains("organize") ||
                lowerResponse.Contains("priorizar") || lowerResponse.Contains("prioritize"))
            {
                return ("organize_tasks", null);
            }

            if (lowerResponse.Contains("categoría") || lowerResponse.Contains("category") ||
                lowerResponse.Contains("categorías") || lowerResponse.Contains("categories"))
            {
                return ("manage_categories", null);
            }

            return (null, null);
        }

        public async Task<bool> IsAIAvailableAsync()
        {
            return await _aiProvider.IsAvailableAsync();
        }

        public string GetProviderName()
        {
            return _aiProvider.ProviderName;
        }
    }
}
