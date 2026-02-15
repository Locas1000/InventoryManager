namespace Server.Models;

public class Inventory
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    // The "?" makes this optional (nullable). Not every inventory needs an image.
    public string? ImageUrl { get; set; } 
    public string CustomIdTemplate { get; set; } = string.Empty;
    // Foreign key  
    public int UserId { get; set; }
    // Navigation Property: Allows you to access the user details easily in C# code.
    public User User { get; set; } = null!;
    
    // Instead of dynamic fields, we define the titles and visibility for the 3 allowed string fields.
    // If String1Name is null, it means the user hasn't added this custom field to their inventory.
    public string? String1Name { get; set; }
    public bool String1Visible { get; set; }
    
    public string? String2Name { get; set; }
    public bool String2Visible { get; set; }

    public string? String3Name { get; set; }
    public bool String3Visible { get; set; }

    // We do the same for Numbers (integers or decimals)
    public string? Number1Name { get; set; }
    public bool Number1Visible { get; set; }
    
    // (You will add Number2, Number3, Text1, Text2, Text3, Bool1, Bool2, Bool3, Link1, Link2, Link3 here as well)

    // Navigation Property: One Inventory has many Items.
    public ICollection<Item> Items { get; set; } = new List<Item>();
}