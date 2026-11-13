using BudgetApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<AppUser>().HasIndex(user => user.Email).IsUnique();
        var transaction = builder.Entity<Transaction>();
        transaction.HasIndex(item => new { item.UserId, item.Date });
        transaction.HasOne<AppUser>().WithMany().HasForeignKey(item => item.UserId);
        transaction.Property(item => item.Category).HasMaxLength(60);
        transaction.Property(item => item.Note).HasMaxLength(200);
        transaction.ToTable(table => table.HasCheckConstraint("CK_Transaction_PositiveAmount", "AmountKopecks > 0"));
    }
}
