using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace TaskFlow.Api.Services
{
    public class SmtpEmailService(IConfiguration config) : IEmailService
    {
        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var smtpHost = config["Smtp:Host"];
            var smtpPort = int.Parse(config["Smtp:Port"] ?? "587");
            var smtpUser = config["Smtp:User"];
            var smtpPass = config["Smtp:Pass"];
            var from = config["Smtp:From"] ?? smtpUser;
            if (string.IsNullOrWhiteSpace(from))
                throw new InvalidOperationException("SMTP 'From' address is not configured.");

            using var client = new SmtpClient(smtpHost, smtpPort)
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
