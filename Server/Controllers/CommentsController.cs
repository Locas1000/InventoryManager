using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers;

[ApiController]
[Route("api/inventories/{inventoryId}/comments")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CommentsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/inventories/5/comments
    [HttpGet]
    [AllowAnonymous] // Anyone can read the discussion
    public async Task<IActionResult> GetComments(int inventoryId)
    {
        // Fetch comments, include the user who wrote them, and sort newest first
        var comments = await _context.Comments
            .Include(c => c.User)
            .Where(c => c.InventoryId == inventoryId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new 
            {
                c.Id,
                c.UserId,
                c.Text,
                c.CreatedAt,
                // Make sure "Username" matches whatever your User model uses for their name!
                UserName = c.User != null ? c.User.Username : "Unknown" 
            })
            .ToListAsync();

        return Ok(comments);
    }

    // POST: api/inventories/5/comments
    [HttpPost]
    [Authorize] // Must be logged in to post
    public async Task<IActionResult> CreateComment(int inventoryId, [FromBody] CreateCommentDto dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        // Verify the inventory actually exists
        var inventoryExists = await _context.Inventories.AnyAsync(i => i.Id == inventoryId);
        if (!inventoryExists) return NotFound("Inventory not found.");

        var comment = new Comment
        {
            Text = dto.Text,
            InventoryId = inventoryId,
            UserId = int.Parse(userIdString),
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok();
    }
    // PUT: api/inventories/5/comments/12
    [HttpPut("{commentId}")]
    [Authorize]
    public async Task<IActionResult> UpdateComment(int inventoryId, int commentId, [FromBody] CreateCommentDto dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        int currentUserId = int.Parse(userIdString);

        var comment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == commentId && c.InventoryId == inventoryId);
        if (comment == null) return NotFound("Comment not found.");

        // SECURITY: Only the author can edit it!
        if (comment.UserId != currentUserId) return Forbid();

        comment.Text = dto.Text;
        await _context.SaveChangesAsync();

        return Ok();
    }

    // DELETE: api/inventories/5/comments/12
    [HttpDelete("{commentId}")]
    [Authorize]
    public async Task<IActionResult> DeleteComment(int inventoryId, int commentId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        int currentUserId = int.Parse(userIdString);

        var comment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == commentId && c.InventoryId == inventoryId);
        if (comment == null) return NotFound("Comment not found.");

        // SECURITY: Only the author can delete it!
        if (comment.UserId != currentUserId) return Forbid();

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return Ok();
    }
}