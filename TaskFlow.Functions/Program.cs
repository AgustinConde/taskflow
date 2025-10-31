using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TaskFlow.Functions.Services;

var host = new HostBuilder()
   .ConfigureFunctionsWorkerDefaults()
   .ConfigureServices(services =>
   {
       services.AddApplicationInsightsTelemetryWorkerService();
       services.AddScoped<IEmailService, SmtpEmailService>();
   })
   .Build();

host.Run();
