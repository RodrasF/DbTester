using DbTester.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DbTester.Infrastructure.Data.Config;

public class TestUserConfiguration : IEntityTypeConfiguration<TestUser>
{
    public void Configure(EntityTypeBuilder<TestUser> builder)
    {
        builder.ToTable("TestUsers");

        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.EncryptedPassword)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(u => u.AssignedRole)
            .HasMaxLength(100);

        // Add indexes
        builder.HasIndex(u => u.Username);
    }
}
