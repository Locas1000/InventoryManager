namespace Server.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool isAdmin { get; set; }

    public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
    
}