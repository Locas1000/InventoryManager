using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly AppDbContext _context;

    public SearchController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/search?q=laptop
    [HttpGet]
    [AllowAnonymous] // Allowing everyone to search public data
    public async Task<IActionResult> GlobalSearch([FromQuery] string q)
    {
        // If the search is empty, just return empty arrays
        if (string.IsNullOrWhiteSpace(q))
        {
            return Ok(new { inventories = new List<object>(), items = new List<object>() });
        }

        var searchTerm = q.ToLower();

        // 🟢 1. Search Inventories (Checking Title, Description, and Category)
        var inventories = await _context.Inventories
            .Where(i => i.Title.ToLower().Contains(searchTerm) || 
                        i.Description.ToLower().Contains(searchTerm) || 
                        i.Category.ToLower().Contains(searchTerm))
            .Select(i => new 
            {
                i.Id,
                i.Title,
                i.Category,
                i.ImageUrl,
                Type = "Inventory"
            })
            .Take(10) // Limit to top 10 results so we don't overload the frontend
            .ToListAsync();

        // 🟢 2. Search Items (Checking Name, CustomId, and the first dynamic string field)
        var items = await _context.Items
            .Include(i => i.Inventory) // Bring in the inventory so we know where this item lives
            .Where(i => i.Name.ToLower().Contains(searchTerm) || 
                        i.CustomId.ToLower().Contains(searchTerm) ||
                        (i.String1Value != null && i.String1Value.ToLower().Contains(searchTerm)))
            .Select(i => new 
            {
                i.Id,
                i.Name,
                i.CustomId,
                InventoryId = i.InventoryId,
                InventoryTitle = i.Inventory != null ? i.Inventory.Title : "Unknown",
                Type = "Item"
            })
            .Take(10)
            .ToListAsync();

        // Return an object containing both lists
        return Ok(new { inventories, items });
    }
}