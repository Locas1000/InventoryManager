using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
    }

    // PHASE 2: Autocomplete Search Endpoint
    [HttpGet("search")]
    [Authorize] // Only logged-in users can search for others
    public async Task<IActionResult> SearchUsers([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return Ok(new List<object>());

        var cleanQuery = query.ToLower();
        
        var users = await _context.Users
            .Where(u => u.Username.ToLower().Contains(cleanQuery) || u.Email.ToLower().Contains(cleanQuery))
            .Select(u => new { u.Id, u.Username, u.Email })
            .Take(10) // Limit results for performance
            .ToListAsync();

        return Ok(users);
    }
}