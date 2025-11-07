using System.Collections.Generic;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Models;
using TaskFlow.Configuration;

namespace TaskFlow.Api.Services;

public class HuggingFaceProvider : IAIProvider
{
    private readonly AiOptions _options;
    private readonly ILogger<HuggingFaceProvider> _logger;
    private readonly HttpClient _httpClient;

    public string ProviderName => "HuggingFace";

    private bool UseRouterApi =>
        !string.IsNullOrWhiteSpace(_options.BaseUrl) &&
        _options.BaseUrl.Contains("router.huggingface.co", StringComparison.OrdinalIgnoreCase);

    public HuggingFaceProvider(
        IOptions<AiOptions> options,
        ILogger<HuggingFaceProvider> logger,
        IHttpClientFactory httpClientFactory)
    {
        _options = options.Value;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient(nameof(HuggingFaceProvider));

        var timeoutSeconds = _options.TimeoutSeconds <= 0 ? 90 : _options.TimeoutSeconds;
        _httpClient.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
    }

    private string? InferenceUrl
    {
        get
        {
            if (string.IsNullOrWhiteSpace(_options.BaseUrl) || string.IsNullOrWhiteSpace(_options.Model))
            {
                return null;
            }

            var baseUrl = _options.BaseUrl.TrimEnd('/');

            if (UseRouterApi)
            {
                return $"{baseUrl}/v1/chat/completions";
            }

            return $"{baseUrl}/{_options.Model}";
        }
    }

    private string? StatusUrl
    {
        get
        {
            if (string.IsNullOrWhiteSpace(_options.Model))
            {
                return null;
            }

            var baseUrl = _options.BaseUrl?.TrimEnd('/');
            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                return null;
            }

            if (UseRouterApi)
            {
                return $"{baseUrl}/v1/models/{_options.Model}";
            }

            if (baseUrl.EndsWith("/models", StringComparison.OrdinalIgnoreCase))
            {
                baseUrl = baseUrl[..^"/models".Length];
                return $"{baseUrl}/status/{_options.Model}";
            }

            // Router endpoints currently do not expose a status route; skip the status probe.
            return null;
        }
    }

    public async Task<bool> IsAvailableAsync()
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("Hugging Face API key is not configured.");
            return false;
        }

        if (string.IsNullOrWhiteSpace(InferenceUrl))
        {
            _logger.LogWarning("Hugging Face model is not configured.");
            return false;
        }

        try
        {
            // Use status endpoint when available to avoid triggering an inference
            if (!string.IsNullOrWhiteSpace(StatusUrl))
            {
                using var statusRequest = new HttpRequestMessage(HttpMethod.Get, StatusUrl);
                statusRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);

                using var statusResponse = await _httpClient.SendAsync(statusRequest);
                if (statusResponse.StatusCode == HttpStatusCode.Unauthorized)
                {
                    _logger.LogError("Hugging Face returned 401 Unauthorized. Check API key.");
                    return false;
                }

                if (statusResponse.StatusCode == HttpStatusCode.Forbidden)
                {
                    _logger.LogError("Hugging Face returned 403 Forbidden. The token may not have access to model {Model}.", _options.Model);
                    return false;
                }

                if (statusResponse.IsSuccessStatusCode)
                {
                    return true;
                }

                if (statusResponse.StatusCode == HttpStatusCode.NotFound)
                {
                    _logger.LogWarning(
                        "Hugging Face status endpoint returned 404 for model {Model}. Falling back to a lightweight inference check.",
                        _options.Model);
                }
            }

            // Fall back to a lightweight inference request to confirm availability
            var probeRequest = CreateInferenceRequest("ping", isProbe: true);
            using var response = await _httpClient.SendAsync(probeRequest);
            return response.IsSuccessStatusCode || response.StatusCode == HttpStatusCode.TooManyRequests;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Unable to reach Hugging Face Inference API");
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
        if (string.IsNullOrWhiteSpace(_options.ApiKey) || string.IsNullOrWhiteSpace(InferenceUrl))
        {
            return language == "es"
                ? "El servicio de IA no está configurado correctamente. Agrega la API Key y el modelo en las variables de entorno."
                : "The AI service is not properly configured. Provide the API key and model in the environment variables.";
        }

        try
        {
            var prompt = AiPromptBuilder.BuildContextualPrompt(systemPrompt, userContext, conversationHistory, message, language);
            var request = CreateInferenceRequest(prompt);

            _logger.LogInformation("Sending request to Hugging Face model {Model}", _options.Model);

            using var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                _logger.LogError("Hugging Face API returned 401 Unauthorized");
                return language == "es"
                    ? "La clave de Hugging Face es inválida o expiró."
                    : "The Hugging Face API key is invalid or expired.";
            }

            if (response.StatusCode == (HttpStatusCode)429)
            {
                _logger.LogWarning("Hugging Face rate limit exceeded");
                return language == "es"
                    ? "Se alcanzó el límite gratuito de la API. Intenta nuevamente más tarde."
                    : "The free API limit was reached. Please try again later.";
            }

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                _logger.LogError(
                    "Hugging Face returned 404 Not Found for model {Model}. Verify the model identifier and AI:BaseUrl configuration.",
                    _options.Model);
                return language == "es"
                    ? "El modelo configurado no está disponible. Verifica el nombre del modelo y la URL base (https://router.huggingface.co)."
                    : "The configured model was not found. Verify the model name and base URL (https://router.huggingface.co).";
            }

            if (response.StatusCode == HttpStatusCode.BadRequest)
            {
                var friendly = BuildRouterErrorMessage(responseContent, language);
                if (!string.IsNullOrWhiteSpace(friendly))
                {
                    return friendly;
                }
            }

            if (response.StatusCode == HttpStatusCode.ServiceUnavailable)
            {
                _logger.LogWarning("Hugging Face model {Model} is loading", _options.Model);
                return language == "es"
                    ? "El modelo aún se está cargando. Intenta nuevamente en unos segundos."
                    : "The model is still loading. Please try again in a few seconds.";
            }

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Hugging Face returned {Status}: {Content}", response.StatusCode, Truncate(responseContent));
                return language == "es"
                    ? "Ocurrió un error al comunicarse con el servicio de IA."
                    : "An error occurred while communicating with the AI service.";
            }

            var generatedText = ExtractGeneratedText(responseContent);
            generatedText = SanitizeModelOutput(generatedText);
            if (string.IsNullOrWhiteSpace(generatedText))
            {
                _logger.LogWarning("Hugging Face response did not include generated text. Raw: {Content}", Truncate(responseContent));
                return language == "es"
                    ? "No recibí una respuesta válida del modelo. Intenta nuevamente."
                    : "The model returned an empty response. Please try again.";
            }

            return generatedText.Trim();
        }
        catch (TaskCanceledException)
        {
            _logger.LogWarning("Hugging Face request timed out");
            return language == "es"
                ? "La solicitud al servicio de IA tardó demasiado. Intenta nuevamente."
                : "The request to the AI service timed out. Please try again.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while calling Hugging Face");
            return language == "es"
                ? "Ocurrió un error al procesar tu mensaje. Intenta nuevamente."
                : "Something went wrong while processing your message. Please try again.";
        }
    }

    private HttpRequestMessage CreateInferenceRequest(string prompt, bool isProbe = false)
    {
        var url = InferenceUrl ?? throw new InvalidOperationException("Inference URL is not configured");

        HttpContent content;

        if (!UseRouterApi)
        {
            var body = new HuggingFaceRequest
            {
                Inputs = prompt,
                Parameters = new HuggingFaceParameters
                {
                    MaxNewTokens = 400,
                    Temperature = 0.6,
                    TopP = 0.9
                },
                Options = new HuggingFaceOptions
                {
                    WaitForModel = true
                }
            };

            var json = JsonSerializer.Serialize(body, new JsonSerializerOptions
            {
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            });

            var stringContent = new StringContent(json);
            stringContent.Headers.ContentType = new MediaTypeHeaderValue("application/json")
            {
                CharSet = Encoding.UTF8.WebName
            };
            content = stringContent;
        }
        else
        {
            var routerRequest = new RouterChatRequest
            {
                Model = _options.Model ?? string.Empty,
                Messages = new List<RouterChatMessage>
                {
                    new()
                    {
                        Role = "user",
                        Content = new List<RouterMessageContent>
                        {
                            new()
                            {
                                Type = "text",
                                Text = prompt
                            }
                        }
                    }
                },
                MaxTokens = isProbe ? 32 : 400,
                Temperature = 0.6,
                TopP = 0.9,
                Stream = false
            };

            var json = JsonSerializer.Serialize(routerRequest, new JsonSerializerOptions
            {
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            });

            var stringContent = new StringContent(json, Encoding.UTF8, "application/json");
            content = stringContent;
        }

        var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = content
        };

        if (!string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
        }

        request.Headers.Add("User-Agent", "TaskFlow-AI-Assistant");

        return request;
    }

    private string? ExtractGeneratedText(string responseContent)
    {
        try
        {
            if (UseRouterApi)
            {
                return ExtractRouterContent(responseContent);
            }

            var array = JsonSerializer.Deserialize<List<HuggingFaceResponse>>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (array != null && array.Count != 0)
            {
                return array[0].GeneratedText;
            }

            var single = JsonSerializer.Deserialize<HuggingFaceSingleResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return single?.GeneratedText;
        }
        catch
        {
            return null;
        }
    }

    private static string Truncate(string value, int max = 500)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length <= max)
        {
            return value;
        }

        return value[..max] + "...";
    }

    private record HuggingFaceRequest
    {
        [JsonPropertyName("inputs")]
        public string Inputs { get; init; } = string.Empty;

        [JsonPropertyName("parameters")]
        public HuggingFaceParameters Parameters { get; init; } = new();

        [JsonPropertyName("options")]
        public HuggingFaceOptions Options { get; init; } = new();
    }

    private record HuggingFaceParameters
    {
        [JsonPropertyName("max_new_tokens")]
        public int MaxNewTokens { get; init; }

        [JsonPropertyName("temperature")]
        public double Temperature { get; init; }

        [JsonPropertyName("top_p")]
        public double TopP { get; init; }

        [JsonPropertyName("return_full_text")]
        public bool? ReturnFullText { get; init; } = false;
    }

    private record HuggingFaceOptions
    {
        [JsonPropertyName("wait_for_model")]
        public bool WaitForModel { get; init; }
    }

    private record HuggingFaceResponse
    {
        [JsonPropertyName("generated_text")]
        public string? GeneratedText { get; init; }
    }

    private record HuggingFaceSingleResponse
    {
        [JsonPropertyName("generated_text")]
        public string? GeneratedText { get; init; }
    }

    private string? BuildRouterErrorMessage(string responseContent, string language)
    {
        if (!UseRouterApi)
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(responseContent);
            if (!document.RootElement.TryGetProperty("error", out var errorElement))
            {
                return null;
            }

            string? message = null;
            string? code = null;

            if (errorElement.ValueKind == JsonValueKind.String)
            {
                message = errorElement.GetString();
            }
            else if (errorElement.ValueKind == JsonValueKind.Object)
            {
                if (errorElement.TryGetProperty("message", out var messageElement) && messageElement.ValueKind == JsonValueKind.String)
                {
                    message = messageElement.GetString();
                }

                if (errorElement.TryGetProperty("code", out var codeElement) && codeElement.ValueKind == JsonValueKind.String)
                {
                    code = codeElement.GetString();
                }
            }

            if (string.Equals(code, "model_not_supported", StringComparison.OrdinalIgnoreCase))
            {
                var model = string.IsNullOrWhiteSpace(_options.Model) ? "(sin configurar)" : _options.Model;
                return language == "es"
                    ? $"El router de Hugging Face indica que el modelo '{model}' no está habilitado para tu token. Elige uno disponible con tu credencial desde https://router.huggingface.co/v1/models o actualiza AI__MODEL."
                    : $"Hugging Face router reports that the model '{model}' is not enabled for your token. Pick one available to your credential via https://router.huggingface.co/v1/models or update AI__MODEL.";
            }

            return message;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static string SanitizeModelOutput(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var sanitized = Regex.Replace(text, "<think>.*?</think>", string.Empty, RegexOptions.IgnoreCase | RegexOptions.Singleline);
        sanitized = Regex.Replace(sanitized, "</?analysis>", string.Empty, RegexOptions.IgnoreCase);
        sanitized = Regex.Replace(sanitized, "</?reasoning>", string.Empty, RegexOptions.IgnoreCase);

        return sanitized.Trim();
    }

    private static string? ExtractRouterContent(string responseContent)
    {
        try
        {
            using var document = JsonDocument.Parse(responseContent);
            if (!document.RootElement.TryGetProperty("choices", out var choices) || choices.ValueKind != JsonValueKind.Array)
            {
                return null;
            }

            foreach (var choice in choices.EnumerateArray())
            {
                if (!choice.TryGetProperty("message", out var message) || message.ValueKind != JsonValueKind.Object)
                {
                    continue;
                }

                if (message.TryGetProperty("content", out var content))
                {
                    var text = ExtractFromContentElement(content);
                    if (!string.IsNullOrWhiteSpace(text))
                    {
                        return text;
                    }
                }

                if (message.TryGetProperty("text", out var textElement) && textElement.ValueKind == JsonValueKind.String)
                {
                    var text = textElement.GetString();
                    if (!string.IsNullOrWhiteSpace(text))
                    {
                        return text;
                    }
                }
            }

            return null;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static string? ExtractFromContentElement(JsonElement content)
    {
        switch (content.ValueKind)
        {
            case JsonValueKind.String:
                return content.GetString();
            case JsonValueKind.Array:
                foreach (var item in content.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String)
                    {
                        var candidate = item.GetString();
                        if (!string.IsNullOrWhiteSpace(candidate))
                        {
                            return candidate;
                        }
                    }

                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        if (item.TryGetProperty("text", out var textElement) && textElement.ValueKind == JsonValueKind.String)
                        {
                            var candidate = textElement.GetString();
                            if (!string.IsNullOrWhiteSpace(candidate))
                            {
                                return candidate;
                            }
                        }

                        if (item.TryGetProperty("content", out var nestedContent))
                        {
                            var candidate = ExtractFromContentElement(nestedContent);
                            if (!string.IsNullOrWhiteSpace(candidate))
                            {
                                return candidate;
                            }
                        }
                    }
                }
                break;
        }

        return null;
    }

    private record RouterChatRequest
    {
        [JsonPropertyName("model")]
        public string Model { get; init; } = string.Empty;

        [JsonPropertyName("messages")]
        public List<RouterChatMessage> Messages { get; init; } = new();

        [JsonPropertyName("max_tokens")]
        public int MaxTokens { get; init; }

        [JsonPropertyName("temperature")]
        public double Temperature { get; init; }

        [JsonPropertyName("top_p")]
        public double TopP { get; init; }

        [JsonPropertyName("stream")]
        public bool Stream { get; init; }
    }

    private record RouterChatMessage
    {
        [JsonPropertyName("role")]
        public string Role { get; init; } = "user";

        [JsonPropertyName("content")]
        public List<RouterMessageContent> Content { get; init; } = new();
    }

    private record RouterMessageContent
    {
        [JsonPropertyName("type")]
        public string Type { get; init; } = "text";

        [JsonPropertyName("text")]
        public string Text { get; init; } = string.Empty;
    }
}
