using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Server.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    // We store the HASH, not the plain password
    [JsonIgnore] // Never send the hash back to the frontend
    public string? PasswordHash { get; set; } = string.Empty; // needs to be null beacuse of users using social networks for login

    public string Role { get; set; } = "User";
    
    public string AuthProvider { get; set; } = string.Empty;
    
    public string? ProviderKey { get; set; }
    
    public ICollection<ItemLike> LikedItems { get; set; } = new List<ItemLike>();
    
    // Navigation property
    public List<Inventory> Inventories { get; set; } = new();
}
