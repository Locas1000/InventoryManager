using System.Text.Json.Serialization;

namespace Server.Models;

public class Tag
{
    public int Id { get; set; }
    
    // We will make sure this is always saved as lowercase so "Laptop" and "laptop" don't create duplicates
    public string Name { get; set; } = string.Empty;

    // The many-to-many relationship back to inventories
    [JsonIgnore] // This stops infinite loops when sending JSON to React
    public List<Inventory> Inventories { get; set; } = new();
}