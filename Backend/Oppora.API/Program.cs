using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Oppora.API.Data;
using Oppora.API.Interfaces;
using Oppora.API.Models;
using Oppora.API.Repositories;
using Oppora.API.Services;
using Oppora.API.Services.Import;
using Oppora.API.Services.Import.Importers;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy
            .SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });
});

// Memory Cache & Controllers
builder.Services.AddMemoryCache();
builder.Services.AddControllers();

// Repositories & Services
builder.Services.AddScoped<ICompetitionRepository, CompetitionRepository>();
builder.Services.AddScoped<ICompetitionService, CompetitionService>();
builder.Services.AddScoped<CloudinaryService>();
builder.Services.AddScoped<ICompetitionImporter, CsvCompetitionImporter>();
builder.Services.AddScoped<ICompetitionImporter, RssCompetitionImporter>();
builder.Services.AddScoped<ICompetitionImporter, ApiCompetitionImporter>();
builder.Services.AddScoped<ICompetitionImporter, ManualCompetitionImporter>();
builder.Services.AddScoped<CompetitionImporterFactory>();
builder.Services.AddScoped<ICompetitionIngestionService, CompetitionIngestionService>();

// Interview Module Services & Repositories
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection(EmailSettings.SectionName));
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHttpClient<IGoogleCalendarService, GoogleCalendarService>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IInterviewRepository, InterviewRepository>();
builder.Services.AddScoped<ICandidateRepository, CandidateRepository>();
builder.Services.AddScoped<IInterviewerRepository, InterviewerRepository>();
builder.Services.AddScoped<IMeetingService, MeetingService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IInterviewService, InterviewService>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SupportNonNullableReferenceTypes();
    c.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Description = "Enter JWT Token like: Bearer {your token}",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer"
        });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// AppDbContext - Support EF Core Code First (MySQL / SQL Server)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";
var dbProvider = builder.Configuration["DatabaseProvider"] ?? "MySQL";

// Resilient socket check to test if MySQL service is listening on port 3306
bool isMySqlAvailable = false;
try
{
    using var client = new System.Net.Sockets.TcpClient();
    var result = client.BeginConnect("127.0.0.1", 3306, null, null);
    isMySqlAvailable = result.AsyncWaitHandle.WaitOne(TimeSpan.FromMilliseconds(400));
    if (!isMySqlAvailable)
    {
        using var client2 = new System.Net.Sockets.TcpClient();
        var result2 = client2.BeginConnect("localhost", 3306, null, null);
        isMySqlAvailable = result2.AsyncWaitHandle.WaitOne(TimeSpan.FromMilliseconds(400));
    }
}
catch { }

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (isMySqlAvailable && !string.IsNullOrWhiteSpace(connectionString))
    {
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 31));
        options.UseMySql(connectionString, serverVersion, mysqlOptions =>
        {
            mysqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
        });
    }
    else
    {
        options.UseSqlServer("Server=localhost;Database=OpporaDB;Trusted_Connection=True;TrustServerCertificate=True;");
    }
});

// Authentication & JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SUPER_SECRET_FALLBACK_KEY_123456789";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "OpporaIssuer",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "OpporaAudience",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

var app = builder.Build();

// Enable Swagger in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed Database
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await DbInitializer.SeedAsync(context);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Program] DB Seeding Warning: {ex.Message}");
    }
}

app.Run();