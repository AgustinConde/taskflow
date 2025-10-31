using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using TaskFlow.Functions.Services;

namespace TaskFlow.Functions;

public class ProcessEmailQueue(ILogger<ProcessEmailQueue> logger, IEmailService emailService)
{
    private readonly ILogger<ProcessEmailQueue> _logger = logger;
    private readonly IEmailService _emailService = emailService;

    [Function("ProcessEmailQueue")]
    public async Task Run(
        [QueueTrigger("email-queue", Connection = "AzureStorage__ConnectionString")] string message)
    {
        _logger.LogInformation("Processing email from queue: {Message}", message);

        try
        {
            var emailData = JsonSerializer.Deserialize<EmailMessage>(message);

            if (emailData == null)
            {
                _logger.LogWarning("Failed to deserialize email message");
                return;
            }

            await _emailService.SendEmailAsync(emailData.To, emailData.Subject, emailData.Body);

            _logger.LogInformation("Email sent successfully to {To}", emailData.To);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process email from queue");
            throw;
        }
    }

    private class EmailMessage
    {
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public DateTime QueuedAt { get; set; }
    }
}
