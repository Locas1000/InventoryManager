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
[Authorize] 
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
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        
        var currentUser = await _context.Users.FindAsync(int.Parse(userIdString));
        if (currentUser == null || currentUser.Role != "Admin") return Forbid(); 

        var totalUsers = await _context.Users.CountAsync();
        var totalInventories = await _context.Inventories.CountAsync();
        var totalItems = await _context.Items.CountAsync();

        var usersList = await _context.Users
            .Select(u => new 
            {
                u.Id,
                u.Username,
                u.Email,
                u.Role,
                u.IsBlocked, // 🟢 PHASE 2: Send block status to frontend
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
        var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentAdmin = await _context.Users.FindAsync(int.Parse(adminIdString));
        if (currentAdmin == null || currentAdmin.Role != "Admin") return Forbid();

        var targetUser = await _context.Users.FindAsync(id);
        if (targetUser == null) return NotFound("User not found.");

        if (dto.Role != "Admin" && dto.Role != "User") return BadRequest("Invalid role.");
        
        targetUser.Role = dto.Role;
        await _context.SaveChangesAsync();

        return Ok();
    }

    // 🟢 PHASE 2: Toggle Block Status
    [HttpPut("users/{id}/toggle-block")]
    public async Task<IActionResult> ToggleBlockUser(int id)
    {
        var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentAdmin = await _context.Users.FindAsync(int.Parse(adminIdString));
        if (currentAdmin == null || currentAdmin.Role != "Admin") return Forbid();

        var targetUser = await _context.Users.FindAsync(id);
        if (targetUser == null) return NotFound("User not found.");

        targetUser.IsBlocked = !targetUser.IsBlocked;
        await _context.SaveChangesAsync();

        return Ok(new { targetUser.Id, targetUser.IsBlocked });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentAdmin = await _context.Users.FindAsync(int.Parse(adminIdString));
        if (currentAdmin == null || currentAdmin.Role != "Admin") return Forbid();

        var targetUser = await _context.Users.FindAsync(id);
        if (targetUser == null) return NotFound("User not found.");

        _context.Users.Remove(targetUser);
        await _context.SaveChangesAsync();

        return Ok();
    }
 
}