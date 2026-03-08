using System.Text.Json.Serialization;

namespace Server.Models;

public class Comment
{
    public int Id { get; set; }
    
    // The actual markdown text
    public string Text { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Link to the user who wrote it
    public int UserId { get; set; }
    public User? User { get; set; }

    // Link to the inventory it belongs to
    public int InventoryId { get; set; }
    
    [JsonIgnore]
    public Inventory? Inventory { get; set; }
}