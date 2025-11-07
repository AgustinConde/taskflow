using System;
using System.Globalization;
using System.Text;
using Microsoft.Extensions.Options;
using TaskFlow.Configuration;

namespace TaskFlow.Functions.Services;

public class DebugEmailService : IEmailService
{
    private readonly string _dropFolder;

    public DebugEmailService(IOptions<EmailOptions> options)
    {
        var configuredPath = options.Value.DebugDropFolder;
        var basePath = string.IsNullOrWhiteSpace(configuredPath)
            ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "TaskFlow", "emails")
            : configuredPath;

        _dropFolder = Path.GetFullPath(basePath);
    }

    public Task SendEmailAsync(string to, string subject, string body)
    {
        Directory.CreateDirectory(_dropFolder);

        var fileName = string.Format(CultureInfo.InvariantCulture, "{0:yyyyMMddHHmmssfff}-{1:N}.eml", DateTime.UtcNow, Guid.NewGuid());
        var filePath = Path.Combine(_dropFolder, fileName);

        var builder = new StringBuilder();
        builder.AppendLine($"To: {to}");
        builder.AppendLine($"Subject: {subject}");
        builder.AppendLine("Content-Type: text/plain; charset=utf-8");
        builder.AppendLine();
        builder.AppendLine(body);

        File.WriteAllText(filePath, builder.ToString(), Encoding.UTF8);

        return Task.CompletedTask;
    }
}
