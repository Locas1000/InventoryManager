using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Models;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. REGISTER SERVICES (Before Build)
// ==========================================

// Database Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Custom Services
builder.Services.AddScoped<Server.Services.CustomIdGenerator>();

// Controllers & JSON Options
builder.Services.AddControllers().AddJsonOptions(options =>
{
    // This prevents the infinite loop when returning database models
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

// ==========================================
// 2. BUILD THE APP
// ==========================================
var app = builder.Build();

// ==========================================
// 3. CONFIGURE PIPELINE (Middleware)
// ==========================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// IMPORTANT: Authentication must come BEFORE Authorization
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();