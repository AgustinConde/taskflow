using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using TaskFlow.Configuration;

namespace TaskFlow.Api.Services
{
    public class SmtpEmailService(IOptions<SmtpOptions> options) : IEmailService
    {
        private readonly SmtpOptions _options = options.Value;

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            if (string.IsNullOrWhiteSpace(_options.Host))
                throw new InvalidOperationException("SMTP host is not configured.");

            var smtpPort = _options.Port <= 0 ? 587 : _options.Port;
            var smtpUser = _options.User;
            var smtpPass = _options.Pass;
            var from = string.IsNullOrWhiteSpace(_options.From) ? smtpUser : _options.From;
            if (string.IsNullOrWhiteSpace(from))
                throw new InvalidOperationException("SMTP 'From' address is not configured.");

            using var client = new SmtpClient(_options.Host, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true,
                UseDefaultCredentials = false,
                DeliveryMethod = SmtpDeliveryMethod.Network
            };

            var mail = new MailMessage(from, to, subject, body)
            {
                IsBodyHtml = true
            };

            await client.SendMailAsync(mail);
        }
    }
}
