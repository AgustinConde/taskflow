using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using TaskFlow.Configuration;

namespace TaskFlow.Functions.Services;

public class SmtpEmailService : IEmailService
{
    private readonly SmtpOptions _options;

    public SmtpEmailService(IOptions<SmtpOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        if (string.IsNullOrWhiteSpace(_options.Host))
        {
            throw new InvalidOperationException("SMTP host is not configured.");
        }

        var smtpPort = _options.Port <= 0 ? 587 : _options.Port;
        var smtpUser = _options.User;
        var smtpPass = _options.Pass;
        var smtpFrom = string.IsNullOrWhiteSpace(_options.From) ? smtpUser : _options.From;

        if (string.IsNullOrWhiteSpace(smtpFrom))
        {
            throw new InvalidOperationException("SMTP 'From' address is not configured.");
        }

        using var client = new SmtpClient(_options.Host, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUser, smtpPass),
            EnableSsl = true,
            UseDefaultCredentials = false,
            DeliveryMethod = SmtpDeliveryMethod.Network
        };

        using var mailMessage = new MailMessage
        {
            From = new MailAddress(smtpFrom),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };

        mailMessage.To.Add(to);

        await client.SendMailAsync(mailMessage);
    }
}
