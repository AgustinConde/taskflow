using Azure.Storage.Queues;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TaskFlow.Api.DTOs;
using TaskFlow.Configuration;

namespace TaskFlow.Api.Services;

public class EmailQueueService
{
    private readonly QueueClient _queueClient;
    private readonly ILogger<EmailQueueService> _logger;
    private readonly string _queueName;

    public EmailQueueService(IOptions<AzureStorageOptions> storageOptions, ILogger<EmailQueueService> logger)
    {
        _logger = logger;
        var options = storageOptions.Value;
        var connectionString = options.ConnectionString;
        _queueName = string.IsNullOrWhiteSpace(options.QueueName) ? "email-queue" : options.QueueName;
        if (string.IsNullOrEmpty(connectionString))
        {
            _logger.LogWarning("Azure Storage connection string not found. Email queue service will not be available.");
            _queueClient = null!;
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
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize email queue '{QueueName}'", _queueName);
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
