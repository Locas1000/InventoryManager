namespace Server.DTOs;

public class UpdateItemDto
{
    public string Name { get; set; } = string.Empty;
    public string CustomId { get; set; } = string.Empty;
    
    public bool IsPublic { get; set; } = false;

    // 1. Single-Line Strings
    public string? String1Value { get; set; }
    public string? String2Value { get; set; }
    public string? String3Value { get; set; }

    // 2. Multi-Line Text
    public string? Text1Value { get; set; }
    public string? Text2Value { get; set; }
    public string? Text3Value { get; set; }

    // 3. Numbers (Match the type you used in Item.cs, usually double? or decimal?)
    public double? Number1Value { get; set; }
    public double? Number2Value { get; set; }
    public double? Number3Value { get; set; }

    // 4. Booleans
    public bool Bool1Value { get; set; }
    public bool Bool2Value { get; set; }
    public bool Bool3Value { get; set; }
    
    //image
    public string? ImageUrl { get; set; }
}