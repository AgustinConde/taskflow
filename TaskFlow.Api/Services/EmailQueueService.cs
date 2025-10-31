using Azure.Storage.Queues;
using System.Text.Json;
using TaskFlow.Api.DTOs;

namespace TaskFlow.Api.Services;

public class EmailQueueService
{
    private readonly QueueClient _queueClient;
    private readonly ILogger<EmailQueueService> _logger;

    public EmailQueueService(IConfiguration config, ILogger<EmailQueueService> logger)
    {
        _logger = logger;
        var connectionString = config["AZURE_STORAGE_CONNECTION_STRING"];

        if (string.IsNullOrEmpty(connectionString))
        {
            _logger.LogWarning("Azure Storage connection string not found. Email queue service will not be available.");
            _queueClient = null!;
            return;
        }

        _queueClient = new QueueClient(connectionString, "email-queue");

        try
        {
            _queueClient.CreateIfNotExists();
            _logger.LogInformation("Email queue initialized successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize email queue");
        }
    }

    public async Task QueueEmailAsync(string to, string subject, string body)
    {
        if (_queueClient == null)
        {
            _logger.LogWarning("Queue client not initialized. Email will not be queued.");
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
            _logger.LogError(ex, "Failed to queue email to {To}", to);
            throw;
        }
    }

    public async Task<bool> IsQueueAvailableAsync()
    {
        if (_queueClient == null) return false;

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
}
