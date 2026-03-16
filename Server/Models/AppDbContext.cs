using Microsoft.EntityFrameworkCore;

namespace Server.Models;

// is the conexion in between the C# classes and the DB
public class AppDbContext : DbContext
{
    //turns the models created and turns it into tables 
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    
    public DbSet<User> Users => Set<User>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ItemLike> ItemLikes => Set<ItemLike>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<InventoryAccess> InventoryAccesses => Set<InventoryAccess>();
    
    // This ceates the DB rules, relationships 
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // creates a composite primary key so a user can only like an item once 
        modelBuilder.Entity<ItemLike>()
            .HasKey(il => new { il.ItemId, il.UserId });

        //  explains the relation with likes and items 
        modelBuilder.Entity<ItemLike>()
            .HasOne(il => il.Item)
            .WithMany(i => i.Likes)
            .HasForeignKey(il => il.ItemId);

        // explains the relashionship with itemlike and the user
        modelBuilder.Entity<ItemLike>()
            .HasOne(il => il.User)
            .WithMany(u => u.LikedItems)
            .HasForeignKey(il => il.UserId);
        
        // Custom IDs are unique only inside the same inventory.
        modelBuilder.Entity<Item>()
            .HasIndex(i => new { i.InventoryId, i.CustomId })
            .IsUnique();

        // RULE 2: Tells EF Core to use the 'Version' property for Optimistic Locking.
        modelBuilder.Entity<Item>()
            .Property(i => i.Version)
            .IsRowVersion();
        
        //  controlls the access control in the inventory
        modelBuilder.Entity<InventoryAccess>()
            .HasKey(ia => new { ia.InventoryId, ia.UserId });

        modelBuilder.Entity<InventoryAccess>()
            .HasOne(ia => ia.Inventory)
            .WithMany(i => i.AllowedUsers)
            .HasForeignKey(ia => ia.InventoryId);

        modelBuilder.Entity<InventoryAccess>()
            .HasOne(ia => ia.User)
            .WithMany(u => u.WriteAccesses)
            .HasForeignKey(ia => ia.UserId);

        // adds categories for the user to add in their inventory
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Equipment" },
            new Category { Id = 2, Name = "Furniture" },
            new Category { Id = 3, Name = "Book" },
            new Category { Id = 4, Name = "Other" }
        );
    }
}

