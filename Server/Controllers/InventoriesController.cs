using Microsoft.AspNetCore.Authorization; 
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Models;
using System.Security.Claims; 

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // <--- LOCKS DOWN THE CONTROLLER
public class InventoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public InventoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous] // Allowing everyone to view the dashboard list
    public async Task<IActionResult> GetInventories([FromQuery] string? tag)
    {
        var query = _context.Inventories.Include(i => i.Tags).AsQueryable();

        // 🟢 NEW: If the React frontend asks for a specific tag, filter the database!
        if (!string.IsNullOrWhiteSpace(tag))
        {
            var cleanTag = tag.ToLower();
            query = query.Where(i => i.Tags.Any(t => t.Name == cleanTag));
        }

        // 🟢 Project the data so we include the Tags in the Dashboard response
        var inventories = await query
            .Select(i => new
            {
                i.Id,
                i.Title,
                i.Description,
                i.Category,
                i.ImageUrl,
                Tags = i.Tags.Select(t => t.Name).ToList()
            })
            .OrderByDescending(i => i.Id)
            .ToListAsync();

        return Ok(inventories);
    }


    [HttpGet("{id}")]
    [AllowAnonymous] // Ensures non-authenticated users can still view the inventory in read-only mode
    public async Task<IActionResult> GetInventory(int id)
    {
        // 1. Safely extract the current user ID. If they aren't logged in, it defaults to 0.
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int.TryParse(userIdClaim, out int currentUserId);

        // 2. Fetch the inventory and project exactly the fields the React frontend expects
        var inventory = await _context.Inventories
            .Include(i => i.Items)
            .ThenInclude(item => item.Likes) // 🟢 CRITICAL: Pull in the join table
            .Where(i => i.Id == id)
            .Select(i => new 
            {
                i.Id,
                i.UserId,
                i.Title,
                i.Description,
                i.Category,
                Tags = i.Tags.Select(t => t.Name),
                i.CustomIdTemplate,
                i.ImageUrl,
                
                // Custom Field Definitions
                i.String1Name, i.String2Name, i.String3Name,
                i.Number1Name, i.Number2Name, i.Number3Name,
                i.Text1Name, i.Text2Name, i.Text3Name,
                i.Bool1Name, i.Bool2Name, i.Bool3Name,
                
                // Map the items
                Items = i.Items.Select(item => new 
                {
                    item.Id,
                    item.CustomId,
                    item.Name,
                    item.ImageUrl,
                    // Custom Field Values
                    item.String1Value, item.String2Value, item.String3Value,
                    item.Number1Value, item.Number2Value, item.Number3Value,
                    item.Text1Value, item.Text2Value, item.Text3Value,
                    item.Bool1Value, item.Bool2Value, item.Bool3Value,
                    
                    // 🟢 NEW: Calculate the like data on the fly
                    TotalLikes = item.Likes.Count,
                    CurrentUserLiked = currentUserId != 0 && item.Likes.Any(l => l.UserId == currentUserId)
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (inventory == null)
        {
            return NotFound(new { message = "Inventory not found." });
        }

        return Ok(inventory);
    }

    [HttpPost]
    public async Task<ActionResult<Inventory>> CreateInventory(CreateInventoryDto dto)
    {
        // 1. GET USER ID FROM TOKEN
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized("User ID not found in token.");
        }

        int userId = int.Parse(userIdString);

        // 2. Create the Inventory using the REAL User ID
        var inventory = new Inventory
        {
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            CustomIdTemplate = dto.CustomIdTemplate,
            UserId = userId,
    
            // 🟢 Map the Custom Field Names
            String1Name = dto.String1Name,
            String2Name = dto.String2Name,
            String3Name = dto.String3Name,
            Text1Name = dto.Text1Name,
            Text2Name = dto.Text2Name,
            Text3Name = dto.Text3Name,
            Number1Name = dto.Number1Name,
            Number2Name = dto.Number2Name,
            Number3Name = dto.Number3Name,
            Bool1Name = dto.Bool1Name,
            Bool2Name = dto.Bool2Name,
            Bool3Name = dto.Bool3Name,
            ImageUrl = dto.ImageUrl
        };
// 🟢 Process the Tags
        var tagEntities = new List<Tag>();
        foreach (var tagName in dto.Tags)
        {
            var cleanName = tagName.Trim().ToLower();
            // Check if the tag already exists in the database
            var existingTag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == cleanName);
            
            if (existingTag != null)
            {
                tagEntities.Add(existingTag); // Use existing
            }
            else
            {
                tagEntities.Add(new Tag { Name = cleanName }); // Create new
            }
        }
        inventory.Tags = tagEntities;
        _context.Inventories.Add(inventory);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInventories), new { id = inventory.Id }, inventory);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateInventory(int id, UpdateInvetoryDto dto)
    {
        var inventory = await _context.Inventories.FindAsync(id);
        if (inventory == null) return NotFound("Inventory not found.");

        inventory.Title = dto.Title;
        inventory.Description = dto.Description;
        inventory.Category = dto.Category;
        inventory.CustomIdTemplate = dto.CustomIdTemplate;

        await _context.SaveChangesAsync();
        return Ok(inventory);
    }
}