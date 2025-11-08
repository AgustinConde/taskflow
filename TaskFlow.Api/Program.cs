using TaskFlow.Api;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Services;
using TaskFlow.Api.UtcDateTimeConverter;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.RateLimiting;
using TaskFlow.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging.AzureAppServices;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

if (builder.Environment.IsProduction())
{
    builder.Logging.AddAzureWebAppDiagnostics();
    builder.Services.Configure<AzureFileLoggerOptions>(options =>
    {
        options.FileName = "taskflow";
        options.FileSizeLimit = 1024 * 1024 * 10;
        options.RetainedFileCountLimit = 5;
    });
    builder.Services.Configure<AzureBlobLoggerOptions>(options =>
    {
        options.BlobName = "taskflow-log.txt";
    });
}

builder.Services
    .AddOptions<SmtpOptions>()
    .Bind(builder.Configuration.GetSection(SmtpOptions.SectionName));

builder.Services
    .AddOptions<AzureStorageOptions>()
    .Bind(builder.Configuration.GetSection(AzureStorageOptions.SectionName))
    .PostConfigure(options =>
    {
        options.ConnectionString ??= builder.Configuration["AZURE_STORAGE_CONNECTION_STRING"];
        options.QueueName = string.IsNullOrWhiteSpace(options.QueueName) ? "email-queue" : options.QueueName;
    });

builder.Services
    .AddOptions<FrontendOptions>()
    .Bind(builder.Configuration.GetSection(FrontendOptions.SectionName))
    .PostConfigure(options =>
    {
        var legacyUrl = builder.Configuration["FRONTEND_URL"];
        if (!string.IsNullOrWhiteSpace(legacyUrl))
        {
            options.Url = legacyUrl;
        }
    });

builder.Services
    .AddOptions<AiOptions>()
    .Bind(builder.Configuration.GetSection(AiOptions.SectionName))
    .PostConfigure(options =>
    {
        var envApiKey = builder.Configuration["AI__APIKEY"] ?? builder.Configuration["HUGGINGFACE_API_KEY"];
        if (!string.IsNullOrWhiteSpace(envApiKey))
        {
            options.ApiKey = envApiKey;
        }

        var envModel = builder.Configuration["AI__MODEL"];
        if (!string.IsNullOrWhiteSpace(envModel))
        {
            options.Model = envModel;
        }

        var envProvider = builder.Configuration["AI__PROVIDER"];
        if (!string.IsNullOrWhiteSpace(envProvider))
        {
            options.Provider = envProvider;
        }

        var envBaseUrl = builder.Configuration["AI__BASEURL"];
        if (!string.IsNullOrWhiteSpace(envBaseUrl))
        {
            options.BaseUrl = envBaseUrl;
        }

        if (options.TimeoutSeconds <= 0 && int.TryParse(builder.Configuration["AI__TIMEOUTSECONDS"], out var timeout))
        {
            options.TimeoutSeconds = timeout;
        }
    });

// Add Application Insights telemetry
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
        options.JsonSerializerOptions.Converters.Add(new NullableUtcDateTimeConverter());
    });

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Enable file upload support for IFormFile parameters
    options.OperationFilter<SwaggerFileOperationFilter>();

    // Map IFormFile to file upload in Swagger UI
    options.MapType<IFormFile>(() => new Microsoft.OpenApi.Models.OpenApiSchema
    {
        Type = "string",
        Format = "binary"
    });

    // Custom schema filter to handle IFormFile in request bodies
    options.SchemaFilter<FileUploadSchemaFilter>();

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter your valid token in the text input below.\r\n\r\n"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddHostedService<UserCleanupService>();
builder.Services.AddScoped<TaskService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<IAchievementService, AchievementService>();
builder.Services.AddScoped<EmailQueueService>();

// AI Assistant services
builder.Services.AddHttpClient();
builder.Services.AddHttpClient(nameof(HuggingFaceProvider));
builder.Services.AddScoped<HuggingFaceProvider>();
builder.Services.AddScoped<OllamaProvider>();
builder.Services.AddScoped<IAIProvider>(sp =>
{
    var options = sp.GetRequiredService<IOptions<AiOptions>>().Value;
    var provider = options.Provider?.Trim().ToLowerInvariant();

    return provider switch
    {
        "ollama" => sp.GetRequiredService<OllamaProvider>(),
        "huggingface" => sp.GetRequiredService<HuggingFaceProvider>(),
        _ => sp.GetRequiredService<HuggingFaceProvider>()
    };
});
builder.Services.AddScoped<AIAssistantService>();

builder.Services.AddDbContext<TaskFlowDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null
        )
    ));

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "your-256-bit-secret-key-here-make-it-long-enough-for-security";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "TaskFlowApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "TaskFlowClient";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(rateLimiterOptions =>
{
    // Global rate limiter - applies to all endpoints by default
    rateLimiterOptions.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 500,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            });
    });

    rateLimiterOptions.AddPolicy("auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    rateLimiterOptions.AddPolicy("api", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    rateLimiterOptions.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;

        var retryAfterSeconds = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter)
            ? (double?)retryAfter.TotalSeconds
            : null;

        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            message = "rate_limit.exceeded",
            retryAfter = retryAfterSeconds
        }, cancellationToken);
    };
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskFlow API v1");
        c.RoutePrefix = "swagger"; // http://localhost:5149/swagger
    });
}

// Middleware to prevent caching of Swagger pages
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/swagger"))
    {
        context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
        context.Response.Headers["Pragma"] = "no-cache";
        context.Response.Headers["Expires"] = "0";
    }
    await next();
});

// app.UseHttpsRedirection(); Enable in production with valid SSL certificate only
app.UseCors();

// Static files middleware for wwwroot
app.UseStaticFiles();

// Rate limiting middleware (before authentication)
app.UseRateLimiter();

// Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed achievements
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TaskFlowDbContext>();
    await AchievementSeeder.SeedAchievementsAsync(context);
}

// Fallback to SPA
app.MapFallback(async context =>
{
    var path = context.Request.Path.Value;
    if (path != null && (path.StartsWith("/api") || path.StartsWith("/swagger")))
    {
        context.Response.StatusCode = 404;
        return;
    }

    await context.Response.SendFileAsync("wwwroot/index.html");
});

app.Run();
