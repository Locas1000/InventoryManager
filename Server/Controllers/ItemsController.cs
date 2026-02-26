using Microsoft.AspNetCore.Mvc;
using Server.DTOs;
using Server.Models;
using Server.Services; 

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly CustomIdGenerator _idGenerator;

    public ItemsController(AppDbContext context, CustomIdGenerator idGenerator)
    {
        _context = context;
        _idGenerator = idGenerator;
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Item>> GetItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null) return NotFound("Item not found.");
        return Ok(item);
    }
    [HttpPost]
    public async Task<ActionResult<Item>> CreateItem(CreateItemDto dto) // <-- Notice it takes the DTO now
    {
        // 1. Find the inventory to get its ID template
        var inventory = await _context.Inventories.FindAsync(dto.InventoryId);
        if (inventory == null) return NotFound("Inventory not found.");

        // 2. Generate the ID using our Service
        var generatedId = await _idGenerator.GenerateIdAsync(dto.InventoryId, inventory.CustomIdTemplate);

        // 3. Build the Item and map the DTO values to the database columns
        var newItem = new Item
        {
            InventoryId = dto.InventoryId,
            CustomId = generatedId,
            String1Value = dto.String1Value,
            String2Value = dto.String2Value,
            String3Value = dto.String3Value,
            Number1Value = dto.Number1Value
        };

        // 4. Save to PostgreSQL
        _context.Items.Add(newItem);
        await _context.SaveChangesAsync();

        // 5. Return 201 Created, pointing to our new GET method
        return CreatedAtAction(nameof(GetItem), new { id = newItem.Id }, newItem);
    }
// DELETE: api/Items/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        // 1. Find the item
        var item = await _context.Items.FindAsync(id);
        
        // 2. If it doesn't exist, return Not Found
        if (item == null)
        {
            return NotFound();
        }

        // 3. Remove from the database
        _context.Items.Remove(item);
        
        // 4. Save changes
        // Note: later we will implement Optimistic Locking here using a version field
        await _context.SaveChangesAsync();

        return NoContent(); // Standard 204 response for successful deletion
    }
}