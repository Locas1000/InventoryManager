namespace Server.Models;

public class ItemLike
{
    public int ItemId { get; set; }
    public Item Item { get; set; } = null!;
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}