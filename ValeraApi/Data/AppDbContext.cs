using Microsoft.EntityFrameworkCore;
using ValeraApi.Models;

namespace ValeraApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Valera> Valeras => Set<Valera>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Valera>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.Property(v => v.Money).HasPrecision(18, 2);
        });
    }
}
