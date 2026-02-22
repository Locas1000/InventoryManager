using System;
using System.Linq;
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
            else if (token == "SEQ")
            {
                var currentItemCount = await _context.Items
                    .Where(i => i.InventoryId == inventoryId)
                    .CountAsync();

                finalId.Append((currentItemCount + 1).ToString("D3"));
            }
            else if (token == "RND6")
            {
                finalId.Append(Guid.NewGuid().ToString().Substring(0, 8).ToUpper());
                
            }
            
        }
        return finalId.ToString();
    }
}

