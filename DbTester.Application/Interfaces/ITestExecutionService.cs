using DbTester.Domain.Entities;

namespace DbTester.Application.Interfaces;

public interface ITestExecutionService
{
    Task<TestRun> ExecuteWorkflowAsync(Guid workflowId);
    Task<OperationResult> ExecuteOperationAsync(TestOperation operation, DatabaseConnection connection);
    Task<TestRun?> GetTestRunResultAsync(Guid testRunId);
    Task<IReadOnlyList<TestRun>> GetRecentTestRunsAsync(int count = 10);
    Task<bool> CancelTestRunAsync(Guid testRunId);
}