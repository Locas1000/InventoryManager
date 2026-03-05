namespace Server.DTOs;

public class UpdateInvetoryDto 
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "Other";
    public string CustomIdTemplate { get; set; } = string.Empty;

    // --- CUSTOM FIELD NAMES (Optional) ---
    public string? String1Name { get; set; }
    public string? String2Name { get; set; }
    public string? String3Name { get; set; }

    public string? Text1Name { get; set; }
    public string? Text2Name { get; set; }
    public string? Text3Name { get; set; }

    public string? Number1Name { get; set; }
    public string? Number2Name { get; set; }
    public string? Number3Name { get; set; }

    public string? Bool1Name { get; set; }
    public string? Bool2Name { get; set; }
    public string? Bool3Name { get; set; }
    public string? ImageUrl { get; set; }
}