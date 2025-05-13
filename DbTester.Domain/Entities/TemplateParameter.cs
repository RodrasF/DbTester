using DbTester.Domain.Common;

namespace DbTester.Domain.Entities;

public class TemplateParameter : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Default value if not overridden
    public string DefaultValue { get; set; } = string.Empty;

    // Current value (when used in a non-template workflow)
    public string? Value { get; set; }

    // Associated workflow
    public Guid TestWorkflowId { get; set; }
    public TestWorkflow? TestWorkflow { get; set; }
}