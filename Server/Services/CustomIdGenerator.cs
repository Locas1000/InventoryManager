using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Server.Models;


namespace Server.Services;

public class CustomIdGenerator
{
    private readonly AppDbContext _context;

    public CustomIdGenerator(AppDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerateIdAsync(int inventoryId, string template)
    {
        if (string.IsNullOrWhiteSpace(template)) return Guid.NewGuid().ToString();
        var finalId = new StringBuilder();
        var tokens = template.Split('|');
        var random = new Random();
   foreach (var token in tokens)
        {
            if (token.StartsWith("FIXED:"))
            {
                finalId.Append(token.Substring(6));
            }
            else if (token.StartsWith("DATE:"))
            {
                var format = token.Substring(5);
                finalId.Append(DateTime.UtcNow.ToString(format));
            }
            // 🟢 THE FIX IS HERE: Use StartsWith instead of "=="
            else if (token.StartsWith("SEQ"))
            {
                // Count how many items currently exist in THIS inventory
                var currentItemCount = await _context.Items
                    .Where(i => i.InventoryId == inventoryId)
                    .CountAsync();
                
                // Split "SEQ:D3" into ["SEQ", "D3"]
                var parts = token.Split(':');
                
                // If they provided a format (like D3 or D4), use it. Otherwise, default to D3.
                var format = parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]) ? parts[1] : "D3"; 
                
                // Add 1 to the count, and format it (e.g., 1 becomes "001")
                finalId.Append((currentItemCount + 1).ToString(format));
            }
            else if (token == "RND6")
            {
                finalId.Append(RandomNumberGenerator.GetInt32(100000, 1000000).ToString());
            }
            else if (token == "RND9")
            {
                finalId.Append(RandomNumberGenerator.GetInt32(100000000, 1000000000).ToString());
            }
            else if (token == "RND20BIT")
            {
                finalId.Append(RandomNumberGenerator.GetInt32(0, 1048576).ToString());
            }
            else if (token == "RND32BIT")
            {
                byte[] bytes = new byte[4];
                RandomNumberGenerator.Fill(bytes);
                finalId.Append(BitConverter.ToUInt32(bytes, 0).ToString());
            }
            else if (token == "GUID")
            {
                finalId.Append(Guid.NewGuid().ToString("N").ToUpper());
            }
        }        return finalId.ToString();
    }
}
