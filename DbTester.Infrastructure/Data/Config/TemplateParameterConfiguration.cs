using DbTester.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DbTester.Infrastructure.Data.Config;

public class TemplateParameterConfiguration : IEntityTypeConfiguration<TemplateParameter>
{
    public void Configure(EntityTypeBuilder<TemplateParameter> builder)
    {
        builder.ToTable("TemplateParameters");

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        builder.Property(p => p.DefaultValue)
            .HasMaxLength(500);
    }
}
