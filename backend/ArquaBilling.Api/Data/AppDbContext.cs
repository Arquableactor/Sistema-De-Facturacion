using ArquaBilling.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Warranty> Warranties => Set<Warranty>();
    public DbSet<WarrantyItem> WarrantyItems => Set<WarrantyItem>();
    public DbSet<NcfSequence> NcfSequences => Set<NcfSequence>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Dinero y cantidades: todo decimal usa precisión (18, 2). Nunca float/double.
        configurationBuilder.Properties<decimal>().HavePrecision(18, 2);

        // Enums guardados como texto en la base de datos.
        configurationBuilder.Properties<UserRole>().HaveConversion<string>().HaveMaxLength(20);
        configurationBuilder.Properties<DocumentType>().HaveConversion<string>().HaveMaxLength(20);
        configurationBuilder.Properties<InvoiceStatus>().HaveConversion<string>().HaveMaxLength(20);
        configurationBuilder.Properties<PaymentMethod>().HaveConversion<string>().HaveMaxLength(20);
        configurationBuilder.Properties<WarrantyStatus>().HaveConversion<string>().HaveMaxLength(20);
        configurationBuilder.Properties<WarrantyItemStatus>().HaveConversion<string>().HaveMaxLength(20);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Nota: Npgsql 8 mapea DateTime a "timestamp with time zone" y espera valores UTC.

        // ----- User -----
        modelBuilder.Entity<User>(e =>
        {
            e.Property(u => u.FullName).HasMaxLength(200);
            e.Property(u => u.Email).HasMaxLength(256);
            e.HasIndex(u => u.Email).IsUnique();
        });

        // ----- Client -----
        modelBuilder.Entity<Client>(e =>
        {
            e.Property(c => c.Name).HasMaxLength(200);
            e.Property(c => c.DocumentNumber).HasMaxLength(30);
            e.Property(c => c.Phone).HasMaxLength(30);
            e.Property(c => c.Email).HasMaxLength(256);
            e.Property(c => c.InstallationAddress).HasMaxLength(300);
        });

        // ----- Product -----
        modelBuilder.Entity<Product>(e =>
        {
            e.Property(p => p.Name).HasMaxLength(200);
            e.Property(p => p.Code).HasMaxLength(50);
            e.Property(p => p.Barcode).HasMaxLength(50);
            e.Property(p => p.Description).HasMaxLength(500);
            e.HasIndex(p => p.Code).IsUnique();
        });

        // ----- Invoice -----
        modelBuilder.Entity<Invoice>(e =>
        {
            e.Property(i => i.InvoiceNumber).HasMaxLength(30);
            e.Property(i => i.NCF).HasMaxLength(19);
            e.Property(i => i.Notes).HasMaxLength(1000);

            e.HasIndex(i => i.InvoiceNumber).IsUnique();
            // NCF único pero permite múltiples nulos (índice parcial filtrado).
            e.HasIndex(i => i.NCF).IsUnique().HasFilter("\"NCF\" IS NOT NULL");

            e.HasOne(i => i.Client)
                .WithMany(c => c.Invoices)
                .HasForeignKey(i => i.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(i => i.User)
                .WithMany(u => u.Invoices)
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ----- InvoiceItem -----
        modelBuilder.Entity<InvoiceItem>(e =>
        {
            e.Property(ii => ii.Description).HasMaxLength(500);
            e.Property(ii => ii.SerialNumber).HasMaxLength(100);

            e.HasOne(ii => ii.Invoice)
                .WithMany(i => i.Items)
                .HasForeignKey(ii => ii.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ii => ii.Product)
                .WithMany(p => p.InvoiceItems)
                .HasForeignKey(ii => ii.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ----- Payment -----
        modelBuilder.Entity<Payment>(e =>
        {
            e.Property(p => p.Reference).HasMaxLength(100);
            e.Property(p => p.Notes).HasMaxLength(1000);

            e.HasOne(p => p.Invoice)
                .WithMany(i => i.Payments)
                .HasForeignKey(p => p.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ----- Warranty -----
        modelBuilder.Entity<Warranty>(e =>
        {
            e.Property(w => w.WarrantyNumber).HasMaxLength(30);
            e.Property(w => w.Notes).HasMaxLength(1000);

            e.HasIndex(w => w.WarrantyNumber).IsUnique();

            e.HasOne(w => w.Invoice)
                .WithMany(i => i.Warranties)
                .HasForeignKey(w => w.InvoiceId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(w => w.Client)
                .WithMany(c => c.Warranties)
                .HasForeignKey(w => w.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ----- WarrantyItem -----
        modelBuilder.Entity<WarrantyItem>(e =>
        {
            e.Property(wi => wi.ProductName).HasMaxLength(200);
            e.Property(wi => wi.SerialNumber).HasMaxLength(100);

            e.HasOne(wi => wi.Warranty)
                .WithMany(w => w.Items)
                .HasForeignKey(wi => wi.WarrantyId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(wi => wi.Product)
                .WithMany(p => p.WarrantyItems)
                .HasForeignKey(wi => wi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ----- NcfSequence (sin relaciones) -----
        modelBuilder.Entity<NcfSequence>(e =>
        {
            e.Property(n => n.Type).HasMaxLength(10);
        });

        // ----- AuditLog (sin relaciones; UserId es int? sin FK) -----
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.Property(a => a.Action).HasMaxLength(100);
            e.Property(a => a.Entity).HasMaxLength(100);
            // Details queda sin límite (texto largo).
        });
    }
}
