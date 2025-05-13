using DbTester.Domain.Common;
using DbTester.Domain.Enums;

namespace DbTester.Domain.Entities;

public class TestOperation : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // The type of operation
    public TestOperationType OperationType { get; set; }

    // The user that will execute this operation
    public Guid TestUserId { get; set; }
    public TestUser? TestUser { get; set; }

    // Order in the workflow
    public int SequenceOrder { get; set; }

    // SQL to execute (for ExecuteRawSql operation type)
    public string? SqlStatement { get; set; }

    // Object name (table, view, procedure) - if applicable
    public string? ObjectName { get; set; }

    // Expected result - success or failure
    public bool ExpectSuccess { get; set; } = true;

    // Parent workflow
    public Guid TestWorkflowId { get; set; }
    public TestWorkflow? TestWorkflow { get; set; }
}