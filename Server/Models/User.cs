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
    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = "User";

    // Navigation property
    public List<Inventory> Inventories { get; set; } = new();
}
