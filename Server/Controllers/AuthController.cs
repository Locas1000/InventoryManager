using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.DTOs;
using Server.Models;
using System.Text.Json;

namespace Server.Controllers;

public class SocialAuthDto
{
    public string Token { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient; // needed for facebook api call

    public AuthController(AppDbContext context, IConfiguration configuration, HttpClient httpClient)
    {
        _context = context;
        _configuration = configuration;
        _httpClient = httpClient;
    }

    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(RegisterDto request)
    {
        // 1. Check if user already exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest("User already exists.");
        }

        // 2. Hash the password (NEVER store plain text!)
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // 3. Create the User
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash, // Ensure your User model has this property!
            Role = "User",// Default role
            AuthProvider = "Local"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("User registered successfully.");
    }

    [HttpPost("login")]
    public async Task<ActionResult<string>> Login(LoginDto request)
    {
        // 1. Find user by email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        
        if (user == null)
        {
            return BadRequest("User not found.");
        }

        // 2. Verify the password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return BadRequest("Wrong password.");
        }

        // 3. Create the JWT Token
        string token = CreateToken(user);

        // Return the token and the user info (so frontend knows who logged in)
        return Ok(new { token, username = user.Username, userId = user.Id,role = user.Role });
    }

[HttpPost("google")]
    public async Task<ActionResult<string>> GoogleLogin([FromBody] SocialAuthDto request)
    {
        try
        {
            // 1. Validate the token cryptographically using Google's library
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                // We will add your ClientId here later: Audience = new[] { "YOUR_GOOGLE_CLIENT_ID" }
            };
            var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, settings);

            // 2. Find or Create the User in your database
            var user = await GetOrCreateSocialUserAsync(payload.Email, payload.Name, "Google", payload.Subject);

            // 3. Generate your standard internal JWT
            string token = CreateToken(user);
            return Ok(new { token, username = user.Username, userId = user.Id, role = user.Role });
        }
        catch (InvalidJwtException)
        {
            return Unauthorized("Invalid Google Token");
        }
    }
public class GithubAuthDto
    {
        public string Code { get; set; } = string.Empty;
    }

    [HttpPost("github")]
    public async Task<ActionResult<string>> GithubLogin([FromBody] GithubAuthDto request)
    {
        try
        {
            // 1. Trade the Code for an Access Token
            var tokenRequest = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "client_id", _configuration["Authentication:Github:ClientId"]! },
                { "client_secret", _configuration["Authentication:Github:ClientSecret"]! },
                { "code", request.Code }
            });

            // We must trick GitHub into thinking we are a normal browser accepting JSON
            _httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
            
            var tokenResponse = await _httpClient.PostAsync("https://github.com/login/oauth/access_token", tokenRequest);
            if (!tokenResponse.IsSuccessStatusCode) return Unauthorized("Failed to trade GitHub code.");

            var tokenContent = await tokenResponse.Content.ReadAsStringAsync();
            var tokenData = JsonSerializer.Deserialize<JsonElement>(tokenContent);
            string accessToken = tokenData.GetProperty("access_token").GetString()!;

            // 2. Use the Access Token to get the User's Profile
            var userRequest = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
            userRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            userRequest.Headers.UserAgent.ParseAdd("InventoryManagerApp"); // GitHub requires a User-Agent

            var userResponse = await _httpClient.SendAsync(userRequest);
            var userContent = await userResponse.Content.ReadAsStringAsync();
            var ghUser = JsonSerializer.Deserialize<JsonElement>(userContent);

            // GitHub users don't always have a public email, so we fallback to their username
            string name = ghUser.GetProperty("login").GetString() ?? "GitHubUser";
            string id = ghUser.GetProperty("id").GetRawText(); // IDs can be numbers in JSON
            
            // Try to get email, if it's null, we create a fake one just for our DB
            string email = ghUser.TryGetProperty("email", out var emailProp) && emailProp.ValueKind != JsonValueKind.Null 
                ? emailProp.GetString()! 
                : $"{name}@github.local";

            // 3. Find or Create the User in your database
            var user = await GetOrCreateSocialUserAsync(email, name, "GitHub", id);

            // 4. Generate your standard internal JWT
            string token = CreateToken(user);
            return Ok(new { token, username = user.Username, userId = user.Id, role = user.Role });
        }
        catch (Exception ex)
        {
            return Unauthorized("GitHub authentication failed: " + ex.Message);
        }
    }
   
    //   Helper method to handle social user creation
    private async Task<User> GetOrCreateSocialUserAsync(string email, string name, string provider, string providerKey)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            user = new User
            {
                Email = email,
                Username = name.Replace(" ", ""), // Clean up spaces for the username
                PasswordHash = null, // No password!
                Role = "User",
                AuthProvider = provider,
                ProviderKey = providerKey
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        return user;
    }
    private string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role ?? "User")
        };

        // Ideally, store this key in appsettings.json! 
        // For now, we use a hardcoded key for the prototype (Must be at least 16 chars).
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("MySuperSecretKeyForSentinelApp123!")); 

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}