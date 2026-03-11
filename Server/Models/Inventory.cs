using System.ComponentModel.DataAnnotations;

namespace Server.Models;

public class Inventory
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; } 
    public string CustomIdTemplate { get; set; } = string.Empty;
    public bool IsPublic { get; set; } = false;
    [Timestamp]
    public byte[]? RowVersion { get; set; }
    public ICollection<InventoryAccess> AllowedUsers { get; set; } = new List<InventoryAccess>();
    public List<Tag> Tags { get; set; } = new();
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public List<Comment> Comments { get; set; } = new();
    
    // Navigation Property: One Inventory has many Items.
    public ICollection<Item> Items { get; set; } = new List<Item>();

    // ==========================================
    // CUSTOM FIELD DEFINITIONS (Names & Visibility)
    // ==========================================

    // 1. Single-Line Strings
    public string? String1Name { get; set; }
    public bool String1Visible { get; set; }
    
    public string? String2Name { get; set; }
    public bool String2Visible { get; set; }

    public string? String3Name { get; set; }
    public bool String3Visible { get; set; }

    // 2. Multi-Line Text (TextAreas)
    public string? Text1Name { get; set; }
    public bool Text1Visible { get; set; }

    public string? Text2Name { get; set; }
    public bool Text2Visible { get; set; }

    public string? Text3Name { get; set; }
    public bool Text3Visible { get; set; }

    // 3. Numbers (integers or decimals)
    public string? Number1Name { get; set; }
    public bool Number1Visible { get; set; }

    public string? Number2Name { get; set; }
    public bool Number2Visible { get; set; }

    public string? Number3Name { get; set; }
    public bool Number3Visible { get; set; }

    // 4. Booleans (Checkboxes)
    public string? Bool1Name { get; set; }
    public bool Bool1Visible { get; set; }

    public string? Bool2Name { get; set; }
    public bool Bool2Visible { get; set; }

    public string? Bool3Name { get; set; }
    public bool Bool3Visible { get; set; }
}