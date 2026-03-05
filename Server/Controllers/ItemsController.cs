using Microsoft.AspNetCore.Mvc;
using Server.DTOs;
using Server.Models;
using Server.Services; 
using Microsoft.EntityFrameworkCore;

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
    public async Task<ActionResult<Item>> CreateItem(CreateItemDto dto)
    {
        var inventory = await _context.Inventories.FindAsync(dto.InventoryId);
        if (inventory == null) return NotFound("Inventory not found.");

        var generatedId = await _idGenerator.GenerateIdAsync(dto.InventoryId, inventory.CustomIdTemplate);

        Console.WriteLine($"---> ATTEMPTING TO SAVE ITEM WITH ID: {generatedId}");

// Example for CreateItem:
        var newItem = new Item
        {
            Name = dto.Name,
            InventoryId = dto.InventoryId,
            CustomId = generatedId,
    
            // 🟢 Map the Custom Field Values
            String1Value = dto.String1Value,
            String2Value = dto.String2Value,
            String3Value = dto.String3Value,
            Text1Value = dto.Text1Value,
            Text2Value = dto.Text2Value,
            Text3Value = dto.Text3Value,
            Number1Value = dto.Number1Value,
            Number2Value = dto.Number2Value,
            Number3Value = dto.Number3Value,
            Bool1Value = dto.Bool1Value,
            Bool2Value = dto.Bool2Value,
            Bool3Value = dto.Bool3Value
        };


        _context.Items.Add(newItem);

        try
        {
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetItem), new { id = newItem.Id }, newItem);
        }
        catch (DbUpdateException ex)
        {
            // 🟢 The ULTIMATE Postgres duplicate key catcher
            var innerEx = ex.InnerException as Npgsql.PostgresException;
            if (innerEx != null && innerEx.SqlState == "23505")
            {
                return BadRequest(new { message = $"Duplicate ID detected! The generator tried to save '{generatedId}' but it already exists. Please check your Inventory ID Template." });
            }

            // If it's something else, throw it
            throw;
        }
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