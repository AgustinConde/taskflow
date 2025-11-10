using Azure.Storage.Queues;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TaskFlow.Configuration;

namespace TaskFlow.Api.Services;

public class EmailQueueService
{
    private readonly QueueClient? _queueClient;
    private readonly bool _queueEnabled;
    private readonly ILogger<EmailQueueService> _logger;
    private readonly IEmailService _emailService;
    private readonly string _queueName;

    public EmailQueueService(IOptions<AzureStorageOptions> storageOptions, IOptions<EmailOptions> emailOptions, ILogger<EmailQueueService> logger, IEmailService emailService)
    {
        _logger = logger;
        _emailService = emailService;
        var options = storageOptions.Value;
        var connectionString = options.ConnectionString;
        _queueName = string.IsNullOrWhiteSpace(options.QueueName) ? "email-queue" : options.QueueName;
        var emailConfig = emailOptions.Value;
        var envForceFallback = Environment.GetEnvironmentVariable("EMAIL_FORCE_SMTP_FALLBACK")
            ?? Environment.GetEnvironmentVariable("EMAIL_FORCE_FALLBACK");
        var forceFallback = emailConfig.ForceSmtpFallback;
        if (!forceFallback && bool.TryParse(envForceFallback, out var envFallbackEnabled))
        {
            forceFallback = envFallbackEnabled;
        }

        if (forceFallback)
        {
            _queueClient = null;
            _queueEnabled = false;
            _logger.LogWarning("Email queue disabled by configuration. Emails will be sent via SMTP directly.");
            return;
        }

        if (string.IsNullOrEmpty(connectionString))
        {
            _logger.LogWarning("Azure Storage connection string not found. Email queue service will not be available.");
            _queueClient = null;
            _queueEnabled = false;
            return;
        }

        _queueClient = new QueueClient(
            connectionString,
            _queueName,
            new QueueClientOptions
            {
                MessageEncoding = QueueMessageEncoding.Base64
            });

        try
        {
            _queueClient.CreateIfNotExists();
            _logger.LogInformation("Email queue '{QueueName}' initialized successfully", _queueName);
            _queueEnabled = true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize email queue '{QueueName}'", _queueName);
            _queueEnabled = false;
            _queueClient = null;
        }
    }

    public async Task QueueEmailAsync(string to, string subject, string body)
    {
        if (!_queueEnabled || _queueClient == null)
        {
            _logger.LogWarning("Queue client not initialized. Sending email directly to {To}.", to);
            await SendDirectAsync(to, subject, body);
            return;
        }

        try
        {
            var emailMessage = new
            {
                To = to,
                Subject = subject,
                Body = body,
                QueuedAt = DateTime.UtcNow
            };

            var json = JsonSerializer.Serialize(emailMessage);
            await _queueClient.SendMessageAsync(json);

            _logger.LogInformation("Email queued successfully to {To}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to queue email to {To}. Attempting direct send fallback.", to);
            await SendDirectAsync(to, subject, body, ex);
        }
    }

    public async Task<bool> IsQueueAvailableAsync()
    {
        if (!_queueEnabled || _queueClient == null) return false;

        try
        {
            await _queueClient.ExistsAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }

    private async Task SendDirectAsync(string to, string subject, string body, Exception? queueFailure = null)
    {
        if (_emailService == null)
        {
            _logger.LogWarning("Fallback email service not available. Email to {To} cannot be sent.", to);
            if (queueFailure != null)
            {
                throw queueFailure;
            }
            throw new InvalidOperationException("Email service not available for fallback.");
        }

        try
        {
            await _emailService.SendEmailAsync(to, subject, body);
            _logger.LogInformation("Email sent directly to {To} via fallback SMTP.", to);
        }
        catch (Exception fallbackEx)
        {
            _logger.LogError(fallbackEx, "Fallback email send failed for {To}.", to);
            if (queueFailure != null)
            {
                throw queueFailure;
            }
            throw;
        }
    }
}
