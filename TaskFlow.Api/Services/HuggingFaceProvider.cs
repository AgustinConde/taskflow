using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
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

    private string? InferenceUrl =>
        string.IsNullOrWhiteSpace(_options.Model)
            ? null
            : $"{_options.BaseUrl.TrimEnd('/')}/{_options.Model}";

    private string? StatusUrl
    {
        get
        {
            if (string.IsNullOrWhiteSpace(_options.Model))
            {
                return null;
            }

            var baseUrl = _options.BaseUrl.TrimEnd('/');
            if (baseUrl.EndsWith("/models", StringComparison.OrdinalIgnoreCase))
            {
                baseUrl = baseUrl[..^"/models".Length];
            }

            return $"{baseUrl}/status/{_options.Model}";
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

                if (statusResponse.IsSuccessStatusCode || statusResponse.StatusCode == HttpStatusCode.NotFound)
                {
                    // NotFound typically means the model is loading but the service is reachable
                    return true;
                }
            }

            // Fall back to a lightweight inference request to confirm availability
            var probeRequest = CreateInferenceRequest("ping");
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

    private HttpRequestMessage CreateInferenceRequest(string prompt)
    {
        var url = InferenceUrl ?? throw new InvalidOperationException("Inference URL is not configured");

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

        var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };

        if (!string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
        }

        request.Headers.Add("User-Agent", "TaskFlow-AI-Assistant");

        return request;
    }

    private static string? ExtractGeneratedText(string responseContent)
    {
        try
        {
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
}
