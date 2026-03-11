namespace Server.Models;

public class InventoryAccess
{
    public int InventoryId { get; set; }
    public Inventory Inventory { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}