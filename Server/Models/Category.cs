using System.ComponentModel.DataAnnotations;

namespace Server.Models;

public class Category
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
}