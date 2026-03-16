using Microsoft.AspNetCore.Mvc;
using Server.DTOs;
using Server.Models;
using Server.Services; 
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

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
   [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateItemDto dto)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null) return NotFound(new { message = "Item not found." });

        var inventory = await _context.Inventories.FindAsync(item.InventoryId);
        
        // Master Write-Access Check
        var currentUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(currentUserIdStr, out int currentUserId);
        var currentUser = await _context.Users.FindAsync(currentUserId);

        if (currentUser == null || currentUser.IsBlocked) return Forbid();

        bool isOwner = inventory!.UserId == currentUserId;
        bool isAdmin = currentUser.Role == "Admin";
        bool isPublic = inventory.IsPublic;
        bool hasExplicitAccess = await _context.InventoryAccesses
            .AnyAsync(ia => ia.InventoryId == inventory.Id && ia.UserId == currentUserId);

        if (!isOwner && !isAdmin && !isPublic && !hasExplicitAccess)
        {
            return Forbid(); 
        }

        item.Name = dto.Name;
        item.CustomId = dto.CustomId; 
        item.ImageUrl = dto.ImageUrl;
        item.String1Value = dto.String1Value; item.String2Value = dto.String2Value; item.String3Value = dto.String3Value;
        item.Text1Value = dto.Text1Value; item.Text2Value = dto.Text2Value; item.Text3Value = dto.Text3Value;
        item.Number1Value = dto.Number1Value; item.Number2Value = dto.Number2Value; item.Number3Value = dto.Number3Value;
        item.Bool1Value = dto.Bool1Value; item.Bool2Value = dto.Bool2Value; item.Bool3Value = dto.Bool3Value;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(item);
        }
        catch (DbUpdateException)
        {
            return BadRequest(new { message = "An item with this Custom ID already exists in this inventory." });
        }
    }
    
    
    [HttpPost("{itemId}/toggle-like")]
    [Authorize] // Ensure only logged-in users can like items
    public async Task<IActionResult> ToggleLike(int itemId)
    {
        // 1. Extract the UserId from the JWT Token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new { message = "Invalid or missing user token." });
        }

        // 2. Verify the item exists
        var itemExists = await _context.Items.AnyAsync(i => i.Id == itemId);
        if (!itemExists)
        {
            return NotFound(new { message = "Item not found." });
        }

        // 3. Check if the user has already liked this specific item
        var existingLike = await _context.ItemLikes
            .FirstOrDefaultAsync(il => il.ItemId == itemId && il.UserId == userId);

        bool isLiked;

        if (existingLike != null)
        {
            // User already liked it -> Remove the like
            _context.ItemLikes.Remove(existingLike);
            isLiked = false;
        }
        else
        {
            // User hasn't liked it -> Add the like
            var newLike = new ItemLike
            {
                ItemId = itemId,
                UserId = userId
            };
            _context.ItemLikes.Add(newLike);
            isLiked = true;
        }

        await _context.SaveChangesAsync();

        // Return the updated status and the new total count to keep the frontend in sync
        var totalLikes = await _context.ItemLikes.CountAsync(il => il.ItemId == itemId);

        return Ok(new { isLiked = isLiked, totalLikes = totalLikes });
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Item>> GetItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null) return NotFound("Item not found.");
        return Ok(item);
    }
    
   [HttpPost]
    [Authorize] //  Must be logged in to create items
    public async Task<ActionResult<Item>> CreateItem(CreateItemDto dto)
    {
        var inventory = await _context.Inventories.FindAsync(dto.InventoryId);
        if (inventory == null) return NotFound("Inventory not found.");

        //  Master Write-Access Check
        var currentUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(currentUserIdStr, out int currentUserId);
        var currentUser = await _context.Users.FindAsync(currentUserId);

        if (currentUser == null || currentUser.IsBlocked) return Forbid();

        bool isOwner = inventory.UserId == currentUserId;
        bool isAdmin = currentUser.Role == "Admin";
        bool isPublic = inventory.IsPublic;
        bool hasExplicitAccess = await _context.InventoryAccesses
            .AnyAsync(ia => ia.InventoryId == inventory.Id && ia.UserId == currentUserId);

        if (!isOwner && !isAdmin && !isPublic && !hasExplicitAccess)
        {
            return Forbid(); 
        }

        var generatedId = await _idGenerator.GenerateIdAsync(dto.InventoryId, inventory.CustomIdTemplate);

        var newItem = new Item
        {
            Name = dto.Name,
            InventoryId = dto.InventoryId,
            CustomId = generatedId,
            ImageUrl = dto.ImageUrl,
            String1Value = dto.String1Value, String2Value = dto.String2Value, String3Value = dto.String3Value,
            Text1Value = dto.Text1Value, Text2Value = dto.Text2Value, Text3Value = dto.Text3Value,
            Number1Value = dto.Number1Value, Number2Value = dto.Number2Value, Number3Value = dto.Number3Value,
            Bool1Value = dto.Bool1Value, Bool2Value = dto.Bool2Value, Bool3Value = dto.Bool3Value
        };

        _context.Items.Add(newItem);

        try
        {
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetItem), new { id = newItem.Id }, newItem);
        }
        catch (DbUpdateException ex)
        {
            var innerEx = ex.InnerException as Npgsql.PostgresException;
            if (innerEx != null && innerEx.SqlState == "23505")
            {
                return BadRequest(new { message = $"Duplicate ID detected! The generator tried to save '{generatedId}' but it already exists. Please check your Inventory ID Template." });
            }
            throw;
        }
    }

[HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null) return NotFound();

        var inventory = await _context.Inventories.FindAsync(item.InventoryId);
    
        //Master Write-Access Check
        var currentUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(currentUserIdStr, out int currentUserId);
        var currentUser = await _context.Users.FindAsync(currentUserId);

        if (currentUser == null || currentUser.IsBlocked) return Forbid();

        bool isOwner = inventory!.UserId == currentUserId;
        bool isAdmin = currentUser.Role == "Admin";
        bool isPublic = inventory.IsPublic;
        bool hasExplicitAccess = await _context.InventoryAccesses
            .AnyAsync(ia => ia.InventoryId == inventory.Id && ia.UserId == currentUserId);

        if (!isOwner && !isAdmin && !isPublic && !hasExplicitAccess)
        {
            return Forbid(); 
        }

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent(); 
    }

}