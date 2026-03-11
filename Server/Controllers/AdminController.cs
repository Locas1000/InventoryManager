using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers;
public class UpdateRoleDto
{
    public string Role { get; set; } = string.Empty;
}
[ApiController]
[Route("api/[controller]")]
[Authorize] // 🟢 Locks down the controller to logged-in users only
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetAdminDashboard()
    {
        // 1. Safely extract the current user ID
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        
        // 2. Query the database to verify their Role
        // (This is safer than relying solely on the JWT token in case roles change mid-session)
        var currentUser = await _context.Users.FindAsync(int.Parse(userIdString));
        if (currentUser == null || currentUser.Role != "Admin")
        {
            return Forbid(); // 🔴 Kicks them out with a 403 Forbidden status
        }

        // 3. Gather system-wide stats
        var totalUsers = await _context.Users.CountAsync();
        var totalInventories = await _context.Inventories.CountAsync();
        var totalItems = await _context.Items.CountAsync();

        // 4. Fetch the list of users so the admin can view them
        var usersList = await _context.Users
            .Select(u => new 
            {
                u.Id,
                u.Username,
                u.Email,
                u.Role,
                InventoryCount = u.Inventories.Count
            })
            .OrderBy(u => u.Id)
            .ToListAsync();

        return Ok(new 
        {
            Stats = new { totalUsers, totalInventories, totalItems },
            Users = usersList
        });
    }
    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleDto dto)
    {
        // 1. Verify the requester is actually an Admin
        var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentAdmin = await _context.Users.FindAsync(int.Parse(adminIdString));
        if (currentAdmin == null || currentAdmin.Role != "Admin") return Forbid();

        // 2. Find the user they want to update
        var targetUser = await _context.Users.FindAsync(id);
        if (targetUser == null) return NotFound("User not found.");

        // 3. Update the role and save
        if (dto.Role != "Admin" && dto.Role != "User") return BadRequest("Invalid role.");
        targetUser.Role = dto.Role;
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        // 1. Verify the requester is actually an Admin
        var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentAdmin = await _context.Users.FindAsync(int.Parse(adminIdString));
        if (currentAdmin == null || currentAdmin.Role != "Admin") return Forbid();

        // 2. Find the user they want to delete
        var targetUser = await _context.Users.FindAsync(id);
        if (targetUser == null) return NotFound("User not found.");

        // 3. Delete and save
        _context.Users.Remove(targetUser);
        await _context.SaveChangesAsync();

        return Ok();
    }
}