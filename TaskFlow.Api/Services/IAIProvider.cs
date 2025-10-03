using TaskFlow.Api.DTOs;
using TaskFlow.Api.Models;

namespace TaskFlow.Api.Services
{
    /// <summary>
    /// Allows easy switching between different AI providers (Ollama, OpenAI, Claude, etc.)
    /// </summary>
    public interface IAIProvider
    {
        /// <summary>
        /// Send a chat message to the AI provider and get a response
        /// </summary>
        /// <param name="message">User's message</param>
        /// <param name="conversationHistory">Previous conversation messages</param>
        /// <param name="userContext">User's tasks, categories, and achievements for context</param>
        /// <param name="systemPrompt">System instructions to guide AI behavior</param>
        /// <param name="language">User's preferred language (es or en)</param>
        /// <returns>AI's response</returns>
        Task<string> SendChatMessageAsync(
            string message,
            List<ChatMessageDto>? conversationHistory,
            UserContext? userContext,
            string systemPrompt,
            string language = "es"
        );
        Task<bool> IsAvailableAsync();
        string ProviderName { get; }
    }
}
