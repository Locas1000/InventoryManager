namespace Server.DTOs;

public class UpdateInvetoryDto // (Note: keep your spelling "Invetory" if that's how the file is named)
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "Other";
    public string CustomIdTemplate { get; set; } = string.Empty;
}
