using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;
using Server.DTOs;
namespace Server.Controllers;


[ApiController]

[Route("api/[controller]")] //Defines the URL that React will call to
public class InventoriesController : ControllerBase
{
    private readonly AppDbContext _context; //this will hold the DB connection

    public InventoriesController(AppDbContext context) // Dependency injection this makes it so i dont run out of memory by creating and destroying the DB connection every request 
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Inventory>>> GetInventories()
    {
        var inventories = await _context.Inventories.ToListAsync(); //converts anything in the Inventories table into a list, and hands it back. We use await so it can work on diferent requests at the same time 
        return Ok(inventories); // returns a http 200 OK response
    }

    [HttpPost]
    public async Task<ActionResult<Inventory>> CreateInventory(CreateInventoryDto dto)
    {

        var inventory = new Inventory //manually map the DTO data to a real inventory model
        {
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            UserId = dto.UserId
        };
            
        _context.Inventories.Add(inventory); //traks the new object 

        await _context.SaveChangesAsync(); //if the data is wrong or the DB is down it will throw an error
        return CreatedAtAction(nameof(GetInventories), new {id = inventory.Id}, inventory); // return a 201 Created status and the new inventory 
    }
    
    
}
