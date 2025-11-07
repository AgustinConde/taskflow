using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using TaskFlow.Functions.Services;

namespace TaskFlow.Functions;

public class ProcessEmailQueue
{
    private readonly IEmailService _emailService;

    public ProcessEmailQueue(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [Function("ProcessEmailQueue")]
    public async Task Run(
        [QueueTrigger("email-queue", Connection = "AzureWebJobsStorage")] string message)
    {
        var emailData = JsonSerializer.Deserialize<EmailMessage>(message);

        if (emailData == null)
        {
            throw new InvalidOperationException("Email payload could not be deserialized.");
        }

        await _emailService.SendEmailAsync(emailData.To, emailData.Subject, emailData.Body);
    }

    private class EmailMessage
    {
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public DateTime QueuedAt { get; set; }
    }
}
