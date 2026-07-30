using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Oppora.API.Data;
using Oppora.API.Services;
using Oppora.API.Services.Import;
using Oppora.API.Services.Import.Importers;
using System.Text;



var builder = WebApplication.CreateBuilder(args);


Console.WriteLine(
    "JWT KEY: " + builder.Configuration["Jwt:Key"]
);



builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
        });
});



// Controllers

builder.Services.AddControllers();



// Services

builder.Services.AddScoped<CloudinaryService>();
builder.Services.AddScoped<ICompetitionImporter, CsvCompetitionImporter>();
builder.Services.AddScoped<ICompetitionImporter, RssCompetitionImporter>();
builder.Services.AddScoped<ICompetitionImporter, ApiCompetitionImporter>();
builder.Services.AddScoped<ICompetitionImporter, ManualCompetitionImporter>();
builder.Services.AddScoped<CompetitionImporterFactory>();
builder.Services.AddScoped<CompetitionIngestionService>();




// Swagger

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{

    c.SupportNonNullableReferenceTypes();


    c.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Description =
            "Enter JWT Token like: Bearer {your token}",

            Name = "Authorization",

            In = ParameterLocation.Header,

            Type = SecuritySchemeType.Http,

            Scheme = "bearer",

            BearerFormat = "JWT"
        });



    c.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                    new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },

                Array.Empty<string>()
            }
        });

});




// Database

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);





// JWT Authentication

builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme
)
.AddJwtBearer(options =>
{

    // Debugging JWT

    options.Events = new JwtBearerEvents
    {

        OnAuthenticationFailed = context =>
        {

            Console.WriteLine("JWT FAILED:");

            Console.WriteLine(
                context.Exception.Message
            );


            return Task.CompletedTask;
        },


        OnTokenValidated = context =>
        {

            Console.WriteLine(
                "JWT SUCCESS"
            );


            return Task.CompletedTask;
        }

    };



    options.TokenValidationParameters =
    new TokenValidationParameters
    {

        ValidateIssuer = true,

        ValidateAudience = true,

        ValidateLifetime = true,

        ValidateIssuerSigningKey = true,


        ValidIssuer =
        builder.Configuration["Jwt:Issuer"],


        ValidAudience =
        builder.Configuration["Jwt:Audience"],


        IssuerSigningKey =
        new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                builder.Configuration["Jwt:Key"]!
            )
        )

    };


});





builder.Services.AddAuthorization();





var app = builder.Build();





if (app.Environment.IsDevelopment())
{

    app.UseSwagger();

    app.UseSwaggerUI();

}




// Middleware

app.UseCors("AllowReact");

app.UseAuthentication();

app.UseAuthorization();


app.MapControllers();


app.Run();