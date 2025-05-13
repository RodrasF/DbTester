using DbTester.Application.Common;

namespace DbTester.Application.TestExecution;

public class TestRunDto
{
    public Guid Id { get; set; }
    public Guid TestWorkflowId { get; set; }
    public string TestWorkflowName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public bool IsCompleted { get; set; }
    public bool IsSuccessful { get; set; }
    public List<OperationResultDto> OperationResults { get; set; } = new List<OperationResultDto>();
    public TimeSpan Duration => EndTime.HasValue ? EndTime.Value - StartTime : DateTime.UtcNow - StartTime;
}

public class OperationResultDto
{
    public Guid Id { get; set; }
    public Guid TestOperationId { get; set; }
    public string OperationName { get; set; } = string.Empty;
    public string OperationDescription { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsSuccessful { get; set; }
    public string? ErrorMessage { get; set; }
    public int? ResultCount { get; set; }
    public string? ResultData { get; set; }
    public bool MatchesExpectedOutcome { get; set; }
    public string Notes { get; set; } = string.Empty;
    public TimeSpan Duration => EndTime - StartTime;
}

public class ExecuteWorkflowRequest
{
    public Guid WorkflowId { get; set; }
}

public class ExecuteWorkflowResponse : BaseResponse
{
    public Guid TestRunId { get; set; }
}

public class GetTestRunRequest
{
    public Guid TestRunId { get; set; }
}

public class GetTestRunResponse : BaseResponse
{
    public TestRunDto? TestRun { get; set; }
}

public class GetRecentTestRunsRequest
{
    public int Count { get; set; } = 10;
    public Guid? WorkflowId { get; set; } // Optional: to filter by workflow
}

public class GetRecentTestRunsResponse : BaseResponse
{
    public List<TestRunDto> TestRuns { get; set; } = new List<TestRunDto>();
}

public class CancelTestRunRequest
{
    public Guid TestRunId { get; set; }
}

public class ExportTestResultsRequest
{
    public Guid TestRunId { get; set; }
    public ExportFormat Format { get; set; }
}

public class ExportTestResultsResponse : BaseResponse
{
    public string? FileContent { get; set; }
    public string? FileName { get; set; }
    public string? ContentType { get; set; }
}

public enum ExportFormat
{
    Pdf,
    Excel,
    Csv
}