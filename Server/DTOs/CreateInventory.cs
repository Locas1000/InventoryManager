using System.ComponentModel.DataAnnotations;

namespace Server.DTOs;

public class CreateInventoryDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = "Other";
    
    // THIS WAS MISSING
    public string CustomIdTemplate { get; set; } = "FIXED:ITEM-|SEQ"; 

    // We don't need UserId here anymore because we get it from the Token!
    // public int UserId { get; set; } <--- Remove this if it's there
}
