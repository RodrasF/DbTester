using DbTester.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DbTester.Infrastructure.Data.Config;

public class TestOperationConfiguration : IEntityTypeConfiguration<TestOperation>
{
    public void Configure(EntityTypeBuilder<TestOperation> builder)
    {
        builder.ToTable("TestOperations");

        builder.Property(o => o.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(o => o.Description)
            .HasMaxLength(1000);

        builder.Property(o => o.SqlStatement)
            .HasMaxLength(5000);

        builder.Property(o => o.ObjectName)
            .HasMaxLength(100);

        // Add indexes
        builder.HasIndex(o => o.SequenceOrder);
        builder.HasIndex(o => o.TestWorkflowId);
    }
}
