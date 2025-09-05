using System.Threading.Tasks;

namespace TaskFlow.Api.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
}
