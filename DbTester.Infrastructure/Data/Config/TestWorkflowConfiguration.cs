using DbTester.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DbTester.Infrastructure.Data.Config;

public class TestWorkflowConfiguration : IEntityTypeConfiguration<TestWorkflow>
{
    public void Configure(EntityTypeBuilder<TestWorkflow> builder)
    {
        builder.ToTable("TestWorkflows");

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(w => w.Description)
            .HasMaxLength(1000);

        // Add indexes
        builder.HasIndex(w => w.Name);
        builder.HasIndex(w => w.IsTemplate);
    }
}
