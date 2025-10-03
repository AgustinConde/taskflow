using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Models;

namespace TaskFlow.Api.Services
{
    public class OllamaProvider : IAIProvider
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<OllamaProvider> _logger;
        private readonly HttpClient _httpClient;
        private readonly string _ollamaBaseUrl;
        private readonly string _modelName;

        public string ProviderName => "Ollama";

        public OllamaProvider(
            IConfiguration configuration,
            ILogger<OllamaProvider> logger,
            IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.Timeout = TimeSpan.FromSeconds(180);

            _ollamaBaseUrl = _configuration["Ollama:BaseUrl"] ?? "http://localhost:11434";
            _modelName = _configuration["Ollama:ModelName"] ?? "llama3.2:latest";
        }

        public async Task<bool> IsAvailableAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_ollamaBaseUrl}/api/tags");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Ollama is not available at {BaseUrl}", _ollamaBaseUrl);
                return false;
            }
        }

        public async Task<string> SendChatMessageAsync(
            string message,
            List<ChatMessageDto>? conversationHistory,
            UserContext? userContext,
            string systemPrompt,
            string language = "es")
        {
            try
            {
                var fullPrompt = BuildContextualPrompt(systemPrompt, userContext, conversationHistory, message, language);

                var requestBody = new
                {
                    model = _modelName,
                    prompt = fullPrompt,
                    stream = false,
                    options = new
                    {
                        temperature = 0.7,
                        top_p = 0.9,
                        num_predict = 300
                    }
                };

                var jsonContent = JsonSerializer.Serialize(requestBody);
                var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                _logger.LogInformation("Sending request to Ollama with model {Model}", _modelName);

                var response = await _httpClient.PostAsync(
                    $"{_ollamaBaseUrl}/api/generate",
                    httpContent
                );

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Ollama API error: {StatusCode} - {Error}", response.StatusCode, errorContent);
                    throw new Exception($"Ollama API error: {response.StatusCode}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("Ollama raw response: {Response}", responseContent.Length > 500 ? responseContent[..500] + "..." : responseContent);

                var ollamaResponse = JsonSerializer.Deserialize<OllamaResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (string.IsNullOrWhiteSpace(ollamaResponse?.Response))
                {
                    _logger.LogWarning("Ollama returned empty response");
                    return "Lo siento, no pude generar una respuesta. Por favor, intenta de nuevo.";
                }

                return ollamaResponse.Response;
            }
            catch (TaskCanceledException)
            {
                _logger.LogWarning("Ollama request timed out");
                var timeoutMsg = language == "es"
                    ? "Lo siento, la solicitud tardó demasiado. Por favor, intenta de nuevo."
                    : "Sorry, the request took too long. Please try again.";
                return timeoutMsg;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error communicating with Ollama");
                var errorMsg = language == "es"
                    ? "Lo siento, hubo un error al procesar tu solicitud. Por favor, asegúrate de que Ollama esté ejecutándose."
                    : "Sorry, there was an error processing your request. Please ensure Ollama is running.";
                return errorMsg;
            }
        }

        private static string BuildContextualPrompt(
            string systemPrompt,
            UserContext? userContext,
            List<ChatMessageDto>? conversationHistory,
            string currentMessage,
            string language = "es")
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
                        foreach (var task in pendingTasks.Take(5)) // Limit to 5 most recent
                        {
                            promptBuilder.AppendLine($"- {task.Title}" +
                                (task.DueDate.HasValue ? $" (Due: {task.DueDate:yyyy-MM-dd})" : ""));
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
                    promptBuilder.AppendLine($"### Categories:");
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
                foreach (var msg in conversationHistory.TakeLast(3)) // Last 3 messages
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

        private class OllamaResponse
        {
            [JsonPropertyName("response")]
            public string? Response { get; set; }

            [JsonPropertyName("done")]
            public bool Done { get; set; }
        }
    }
}
