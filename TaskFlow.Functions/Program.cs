using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.ApplicationInsights;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using TaskFlow.Configuration;
using TaskFlow.Functions.Data;
using TaskFlow.Functions.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((context, services) =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        var configuration = context.Configuration;

        services
            .AddOptions<SmtpOptions>()
            .Bind(configuration.GetSection(SmtpOptions.SectionName));

        services
            .AddOptions<EmailOptions>()
            .Bind(configuration.GetSection(EmailOptions.SectionName));

        services
            .AddOptions<AzureStorageOptions>()
            .Bind(configuration.GetSection(AzureStorageOptions.SectionName))
            .PostConfigure(options =>
            {
                options.ConnectionString ??= configuration["AZURE_STORAGE_CONNECTION_STRING"];
                options.QueueName = string.IsNullOrWhiteSpace(options.QueueName) ? "email-queue" : options.QueueName;
            });

        services.AddSingleton<IEmailService>(sp =>
        {
            var environment = sp.GetRequiredService<IHostEnvironment>();
            var emailOptions = sp.GetRequiredService<IOptions<EmailOptions>>().Value;
            var isDevelopment = environment.IsDevelopment();

            if (emailOptions.UseSmtp && (!isDevelopment || emailOptions.AllowSmtpInDevelopment))
            {
                return ActivatorUtilities.CreateInstance<SmtpEmailService>(sp);
            }

            return ActivatorUtilities.CreateInstance<DebugEmailService>(sp);
        });

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? configuration["ConnectionStrings__DefaultConnection"]
            ?? configuration["ConnectionStrings:DefaultConnection"];

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("ConnectionStrings__DefaultConnection must be configured.");
        }

        services.AddDbContext<TaskFlowDbContext>(options =>
            options.UseSqlServer(
                connectionString,
                sql => sql.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null)));
    })
    .Build();

await host.RunAsync();
