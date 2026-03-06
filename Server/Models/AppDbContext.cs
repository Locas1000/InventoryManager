using Microsoft.EntityFrameworkCore;

namespace Server.Models;

public class AppDbContext : DbContext
{
    // The constructor passes configuration (like your connection string) down to the base class.
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // DbSets represent the actual tables that will be created in PostgreSQL.
    public DbSet<User> Users => Set<User>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<Item> Items => Set<Item>();
    
    public DbSet<ItemLike> ItemLikes { get; set; }
    // This method is used to configure special database rules that can't be set with basic properties.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ItemLike>()
            .HasKey(il => new { il.ItemId, il.UserId });

        // Optional: explicitly define relationships if EF Core doesn't auto-wire them perfectly
        modelBuilder.Entity<ItemLike>()
            .HasOne(il => il.Item)
            .WithMany(i => i.Likes)
            .HasForeignKey(il => il.ItemId);

        modelBuilder.Entity<ItemLike>()
            .HasOne(il => il.User)
            .WithMany(u => u.LikedItems)
            .HasForeignKey(il => il.UserId);
        
        // RULE 1: The course requires that Custom IDs are unique, but ONLY within the same inventory.
        // This creates a composite index in the database enforcing that rule.
        modelBuilder.Entity<Item>()
            .HasIndex(i => new { i.InventoryId, i.CustomId })
            .IsUnique();

        // RULE 2: Tells EF Core to use the 'Version' property for Optimistic Locking.
        modelBuilder.Entity<Item>()
            .Property(i => i.Version)
            .IsRowVersion();
        
    }
}

