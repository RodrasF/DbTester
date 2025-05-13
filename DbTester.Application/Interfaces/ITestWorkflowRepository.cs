using DbTester.Domain.Entities;

namespace DbTester.Application.Interfaces;

public interface ITestWorkflowRepository : IGenericRepository<TestWorkflow>
{
    Task<IReadOnlyList<TestWorkflow>> GetWorkflowsByNameAsync(string name);
    Task<IReadOnlyList<TestWorkflow>> GetTemplatesAsync();
    Task<TestWorkflow> CloneWorkflowAsync(Guid workflowId, string newName);
    Task<TestWorkflow> CreateFromTemplateAsync(Guid templateId, string newName, Dictionary<string, string> parameterValues);
}