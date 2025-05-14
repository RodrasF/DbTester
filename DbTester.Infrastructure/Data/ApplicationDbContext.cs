using DbTester.Domain.Common;
using DbTester.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace DbTester.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // User related entities
    public DbSet<TestUser> TestUsers { get; set; }

    // Database connections
    public DbSet<DatabaseConnection> DatabaseConnections { get; set; }

    // Test workflow related entities
    public DbSet<TestWorkflow> TestWorkflows { get; set; }
    public DbSet<TestOperation> TestOperations { get; set; }
    public DbSet<TestRun> TestRuns { get; set; }
    public DbSet<TemplateParameter> TemplateParameters { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations from the current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Configure the UserPermission class which is owned by TestUser
        modelBuilder.Entity<TestUser>()
            .HasOne(u => u.Connection)
            .WithMany()
            .HasForeignKey(c => c.ConnectionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TestUser>()
            .OwnsMany(u => u.ExpectedPermissions, builder =>
            {
                builder.ToTable("UserPermissions");
                builder.WithOwner().HasForeignKey("TestUserId");
                builder.Property<int>("Id").ValueGeneratedOnAdd();
                builder.HasKey("Id");
            });

        // Configure the OperationResult class which is owned by TestRun
        modelBuilder.Entity<TestRun>()
            .OwnsMany(r => r.OperationResults, builder =>
            {
                builder.ToTable("OperationResults");
                builder.WithOwner(o => o.TestRun).HasForeignKey(o => o.TestRunId);
                builder.Property(o => o.Id);
                builder.HasKey(o => o.Id);

                // Configure relationship to TestOperation
                builder.HasOne(o => o.TestOperation)
                    .WithMany()
                    .HasForeignKey(o => o.TestOperationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

        // Configure TestOperation relationships
        modelBuilder.Entity<TestOperation>()
            .HasOne(o => o.TestUser)
            .WithMany()
            .HasForeignKey(o => o.TestUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TestOperation>()
            .HasOne(o => o.TestWorkflow)
            .WithMany(w => w.Operations)
            .HasForeignKey(o => o.TestWorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure TestWorkflow relationships
        modelBuilder.Entity<TestWorkflow>()
            .HasOne(w => w.DatabaseConnection)
            .WithMany()
            .HasForeignKey(w => w.DatabaseConnectionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure TestWorkflow to TestRun relationship
        modelBuilder.Entity<TestWorkflow>()
            .HasMany(w => w.TestRuns)
            .WithOne(r => r.TestWorkflow)
            .HasForeignKey(r => r.TestWorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure TemplateParameter relationship
        modelBuilder.Entity<TemplateParameter>()
            .HasOne(t => t.TestWorkflow)
            .WithMany(w => w.Parameters)
            .HasForeignKey(t => t.TestWorkflowId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Update timestamps for all entities that are being updated
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.ModifiedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
