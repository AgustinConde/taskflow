using TaskFlow.Api;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Services;
using TaskFlow.Api.UtcDateTimeConverter;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// Load environment variables from .env if it exists
try { DotNetEnv.Env.Load(); } catch { /* Ignore if .env file is not found */ }

var builder = WebApplication.CreateBuilder(args);

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

builder.Services.AddHostedService<UserCleanupService>();
builder.Services.AddScoped<TaskService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<IAchievementService, AchievementService>();

// AI Assistant services
builder.Services.AddHttpClient(); // For OllamaProvider
builder.Services.AddScoped<IAIProvider, OllamaProvider>();
builder.Services.AddScoped<AIAssistantService>();

builder.Services.AddDbContext<TaskFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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
}

// app.UseHttpsRedirection(); Enable in production with valid SSL certificate only
app.UseCors();

// Static files middleware for wwwroot
app.UseStaticFiles();

// Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapControllers();

// Seed achievements
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TaskFlowDbContext>();
    await AchievementSeeder.SeedAchievementsAsync(context);
}

// Fallback to SPA for all non-file routes
app.MapFallbackToFile("index.html");

app.Run();
