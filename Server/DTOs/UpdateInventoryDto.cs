namespace Server.DTOs;

public class UpdateInvetoryDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category{ get; set; } = string.Empty;
    public string CustomIdTemplate { get; set; } = string.Empty;
}