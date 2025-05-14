using DbTester.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DbTester.Infrastructure.Data.Config;

public class DatabaseConnectionConfiguration : IEntityTypeConfiguration<DatabaseConnection>
{
    public void Configure(EntityTypeBuilder<DatabaseConnection> builder)
    {
        builder.ToTable("DatabaseConnections");

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Server)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.DatabaseName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Username)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(c => c.EncryptedPassword)
            .IsRequired()
            .HasMaxLength(500);

        // Add indexes
        builder.HasIndex(c => c.Name);
    }
}
