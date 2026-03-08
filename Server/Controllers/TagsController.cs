using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TagsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/tags/search?q=lap
    [HttpGet("search")]
    public async Task<IActionResult> SearchTags([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return Ok(new List<string>());
        }

        var searchTerm = q.ToLower();

        // Find any tags that start with the search term, take the top 5, and return just their names
        var suggestions = await _context.Tags
            .Where(t => t.Name.StartsWith(searchTerm))
            .OrderBy(t => t.Name)
            .Take(5)
            .Select(t => t.Name)
            .ToListAsync();

        return Ok(suggestions);
    }
    // GET: api/tags/cloud
    [HttpGet("cloud")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTagCloud()
    {
        // Find all tags that are actually attached to an inventory, count them, and sort by most popular
        var tags = await _context.Tags
            .Where(t => t.Inventories.Any()) 
            .Select(t => new 
            { 
                Name = t.Name, 
                Count = t.Inventories.Count 
            })
            .OrderByDescending(t => t.Count)
            .ToListAsync();

        return Ok(tags);
    }
}