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

    // This method is used to configure special database rules that can't be set with basic properties.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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

