using DbTester.Domain.Common;

namespace DbTester.Domain.Entities;

public class TestWorkflow : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // The database connection to use for this workflow
    public Guid DatabaseConnectionId { get; set; }
    public DatabaseConnection? DatabaseConnection { get; set; }

    // The sequence of operations to execute in this workflow
    public List<TestOperation> Operations { get; set; } = new List<TestOperation>();

    // Test results
    public List<TestRun> TestRuns { get; set; } = new List<TestRun>();

    // Whether this workflow is a template
    public bool IsTemplate { get; set; }

    // Template parameters (if this is a template or based on one)
    public List<TemplateParameter> Parameters { get; set; } = new List<TemplateParameter>();
}