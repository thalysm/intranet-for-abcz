using Microsoft.EntityFrameworkCore;
using NaSede.Domain.Entities;

namespace NaSede.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<EventConfirmation> EventConfirmations { get; set; }
    public DbSet<EventNotification> EventNotifications { get; set; }
    public DbSet<News> News { get; set; }
    public DbSet<NewsComment> NewsComments { get; set; }
    public DbSet<AccountStatement> AccountStatements { get; set; }
    public DbSet<MarketplaceItem> MarketplaceItems { get; set; }
    public DbSet<Benefit> Benefits { get; set; }
    public DbSet<LoanSimulation> LoanSimulations { get; set; }
    public DbSet<Request> Requests { get; set; }
    public DbSet<RequestType> RequestTypes { get; set; }
    public DbSet<WhatsAppToken> WhatsAppTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Matricula).IsUnique();
            entity.HasIndex(e => e.WhatsAppNumber);
            entity.Property(e => e.Matricula).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.TimeZone).HasMaxLength(50);
        });

        // Event configuration
        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Location).HasMaxLength(300);
            
            entity.HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // EventConfirmation configuration
        modelBuilder.Entity<EventConfirmation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.EventId, e.UserId }).IsUnique();
            
            entity.HasOne(e => e.Event)
                .WithMany(ev => ev.Confirmations)
                .HasForeignKey(e => e.EventId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.User)
                .WithMany(u => u.EventConfirmations)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // EventNotification configuration
        modelBuilder.Entity<EventNotification>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Event)
                .WithMany(ev => ev.Notifications)
                .HasForeignKey(e => e.EventId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // News configuration
        modelBuilder.Entity<News>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            
            entity.HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // NewsComment configuration
        modelBuilder.Entity<NewsComment>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.News)
                .WithMany(n => n.Comments)
                .HasForeignKey(e => e.NewsId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.User)
                .WithMany(u => u.NewsComments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // AccountStatement configuration
        modelBuilder.Entity<AccountStatement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.FilePath).IsRequired();
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // MarketplaceItem configuration
        modelBuilder.Entity<MarketplaceItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Price).HasPrecision(18, 2);
            
            entity.HasOne(e => e.User)
                .WithMany(u => u.MarketplaceItems)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Benefit configuration
        modelBuilder.Entity<Benefit>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.ButtonAction).HasMaxLength(500);
            
            entity.HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // LoanSimulation configuration
        modelBuilder.Entity<LoanSimulation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Wage).IsRequired();
            entity.Property(e => e.LoanAmount).IsRequired();
            entity.Property(e => e.NumberInstallments).IsRequired();
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Ignora as propriedades calculadas do mapeamento
            entity.Ignore(e => e.WageInReais);
            entity.Ignore(e => e.LoanAmountInReais);
            entity.Ignore(e => e.InterestRate);
            entity.Ignore(e => e.InstallmentValue);
            entity.Ignore(e => e.TotalAmount);
            entity.Ignore(e => e.MaxAllowedLoan);
            entity.Ignore(e => e.IsValidLoan);
        });

        // RequestType configuration
        modelBuilder.Entity<RequestType>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Request configuration
        modelBuilder.Entity<Request>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Response).HasMaxLength(1000);
            
            entity.HasOne(e => e.Type)
                .WithMany(t => t.Requests)
                .HasForeignKey(e => e.TypeId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // WhatsAppToken configuration
        modelBuilder.Entity<WhatsAppToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
