using System.ComponentModel.DataAnnotations;

namespace TaskFlow.Configuration;

public sealed class SmtpOptions
{
    public const string SectionName = "Smtp";

    [Required]
    public string Host { get; set; } = string.Empty;

    [Range(1, 65535)]
    public int Port { get; set; } = 587;

    public string User { get; set; } = string.Empty;

    public string Pass { get; set; } = string.Empty;

    public string? From { get; set; }
}

public sealed class AzureStorageOptions
{
    public const string SectionName = "AzureStorage";

    public string? ConnectionString { get; set; }

    public string QueueName { get; set; } = "email-queue";

    public string? ContainerName { get; set; }
}

public sealed class EmailOptions
{
    public const string SectionName = "Email";

    public bool UseSmtp { get; set; }

    public bool AllowSmtpInDevelopment { get; set; }

    public string? DebugDropFolder { get; set; }
}

public sealed class FrontendOptions
{
    public const string SectionName = "Frontend";

    [Url]
    public string Url { get; set; } = "http://localhost:5173";
}

public sealed class AiOptions
{
    public const string SectionName = "AI";

    public string Provider { get; set; } = "huggingface";

    public string? ApiKey { get; set; }

    public string? Model { get; set; } = "HuggingFaceTB/SmolLM3-3B";

    public string BaseUrl { get; set; } = "https://router.huggingface.co";

    public int TimeoutSeconds { get; set; } = 90;
}
