using Microsoft.AspNetCore.Authorization; // Required for [Authorize]
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Models;
using System.Security.Claims; // Required to read the Token

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
    public async Task<ActionResult<IEnumerable<Inventory>>> GetInventories()
    {
        // Optional: If you only want users to see THEIR own inventories, uncomment the next line:
        // var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        // For now, we'll return all, but we could filter by userId if we wanted.
        var inventories = await _context.Inventories.ToListAsync();
        return Ok(inventories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Inventory>> GetInventory(int id)
    {
        var inventory = await _context.Inventories
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inventory == null)
        {
            return NotFound();
        }

        return Ok(inventory);
    }

    [HttpPost]
    public async Task<ActionResult<Inventory>> CreateInventory(CreateInventoryDto dto)
    {
        // 1. GET USER ID FROM TOKEN
        // The "User" object is available in every Controller because of [Authorize]
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


        _context.Inventories.Add(inventory);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInventories), new { id = inventory.Id }, inventory);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateInventory(int id, UpdateInvetoryDto dto)
    {
        var inventory = await _context.Inventories.FindAsync(id);
        if (inventory == null) return NotFound("Inventory not found.");

        // Optional: Check if the user OWNS this inventory before letting them edit it
        // var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        // if (inventory.UserId != userId) return Forbid();

        inventory.Title = dto.Title;
        inventory.Description = dto.Description;
        inventory.Category = dto.Category;
        inventory.CustomIdTemplate = dto.CustomIdTemplate;

        await _context.SaveChangesAsync();
        return Ok(inventory);
    }
}