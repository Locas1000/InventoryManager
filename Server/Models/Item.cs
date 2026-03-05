using System.ComponentModel.DataAnnotations;

namespace Server.Models;

public class Item
{
    public int Id { get; set; }
    [Required] public string CustomId { get; set; } = string.Empty;
    [Required] public string Name { get; set; } = string.Empty;

    public int InventoryId { get; set; }
    public Inventory Inventory { get; set; } = null!;

    [Timestamp]
    public uint Version { get; set; }

    // ==========================================
    // CUSTOM FIELD VALUES (The actual data)
    // ==========================================

    // Strings
    public string? String1Value { get; set; }
    public string? String2Value { get; set; }
    public string? String3Value { get; set; }

    // Text
    public string? Text1Value { get; set; }
    public string? Text2Value { get; set; }
    public string? Text3Value { get; set; }

    // Numbers (Using double to handle decimals)
    public double? Number1Value { get; set; }
    public double? Number2Value { get; set; }
    public double? Number3Value { get; set; }

    // Booleans
    public bool? Bool1Value { get; set; }
    public bool? Bool2Value { get; set; }
    public bool? Bool3Value { get; set; }
}