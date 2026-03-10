using System.ComponentModel.DataAnnotations;

namespace Server.DTOs;

public class CreateItemDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public int InventoryId { get; set; }

    // ==========================================
    // CUSTOM FIELD VALUES (Optional Data)
    // ==========================================

    // Strings
    public string? String1Value { get; set; }
    public string? String2Value { get; set; }
    public string? String3Value { get; set; }

    // Text Areas
    public string? Text1Value { get; set; }
    public string? Text2Value { get; set; }
    public string? Text3Value { get; set; }

    // Numbers (Using double for decimals/integers)
    public double? Number1Value { get; set; }
    public double? Number2Value { get; set; }
    public double? Number3Value { get; set; }

    // Booleans (Checkboxes)
    public bool? Bool1Value { get; set; }
    public bool? Bool2Value { get; set; }
    public bool? Bool3Value { get; set; }
    
    //image
    public string? ImageUrl { get; set; }
}