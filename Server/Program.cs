using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Models;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models; 

var builder = WebApplication.CreateBuilder(args);

//start services

// Database conection 
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Custom Services
builder.Services.AddScoped<Server.Services.CustomIdGenerator>();

builder.Services.AddHttpClient();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVite",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // Your frontend URL
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});
// Controllers & JSON Options
builder.Services.AddControllers().AddJsonOptions(options =>
{
    // This prevents infinite loop 
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Inventory API", Version = "v1" });

    // Define the "Bearer" security scheme
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

// Authentication Configuration (JWT)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            // In a real app, move this key to appsettings.json!
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("MySuperSecretKeyForSentinelApp123!")),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });
// AUTOMATIC DATABASE MIGRATIONS
//create a "Scope" to run our database updates
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate(); 
        Console.WriteLine("Database migration completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred during migration: {ex.Message}");
    }
}

// Only show the Swagger UI if we are in development mode (not production).
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowVite");   

app.UseHttpsRedirection();

app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();