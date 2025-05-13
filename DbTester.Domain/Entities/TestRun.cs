using DbTester.Domain.Common;

namespace DbTester.Domain.Entities;

public class TestRun : BaseEntity
{
    public Guid TestWorkflowId { get; set; }
    public TestWorkflow? TestWorkflow { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }

    public bool IsCompleted { get; set; }
    public bool IsSuccessful { get; set; }

    // List of operation results in this run
    public List<OperationResult> OperationResults { get; set; } = new List<OperationResult>();
}

public class OperationResult : BaseEntity
{
    public Guid TestRunId { get; set; }
    public TestRun? TestRun { get; set; }

    public Guid TestOperationId { get; set; }
    public TestOperation? TestOperation { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    public bool IsSuccessful { get; set; }
    public string? ErrorMessage { get; set; }

    // For SELECT operations, can store result count
    public int? ResultCount { get; set; }

    // For operations with specific return data
    public string? ResultData { get; set; }

    // Whether this matches the expected outcome
    public bool MatchesExpectedOutcome { get; set; }

    public string Notes { get; set; } = string.Empty;
}