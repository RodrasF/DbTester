using DbTester.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DbTester.Infrastructure.Data.Config;

public class TestRunConfiguration : IEntityTypeConfiguration<TestRun>
{
    public void Configure(EntityTypeBuilder<TestRun> builder)
    {
        builder.ToTable("TestRuns");

        // Add indexes
        builder.HasIndex(r => r.TestWorkflowId);
        builder.HasIndex(r => r.StartTime);
        builder.HasIndex(r => r.IsCompleted);
    }
}
