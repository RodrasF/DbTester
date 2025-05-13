using DbTester.Application.Interfaces;
using DbTester.Domain.Entities;
using DbTester.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DbTester.Infrastructure.Repositories;

public class TestWorkflowRepository : EfGenericRepository<TestWorkflow>, ITestWorkflowRepository
{
    public TestWorkflowRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<TestWorkflow>> GetWorkflowsByNameAsync(string name)
    {
        return await _dbSet
            .Where(w => w.Name.Contains(name))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<TestWorkflow>> GetTemplatesAsync()
    {
        return await _dbSet
            .Where(w => w.IsTemplate)
            .ToListAsync();
    }

    public async Task<TestWorkflow> CloneWorkflowAsync(Guid workflowId, string newName)
    {
        var originalWorkflow = await _dbSet
            .Include(w => w.Operations)
            .Include(w => w.Parameters)
            .FirstOrDefaultAsync(w => w.Id == workflowId);

        if (originalWorkflow == null)
        {
            throw new InvalidOperationException($"Workflow with ID {workflowId} not found");
        }

        var clonedWorkflow = new TestWorkflow
        {
            Name = newName,
            Description = originalWorkflow.Description,
            DatabaseConnectionId = originalWorkflow.DatabaseConnectionId,
            IsTemplate = false
        };

        // Clone operations
        foreach (var operation in originalWorkflow.Operations)
        {
            clonedWorkflow.Operations.Add(new TestOperation
            {
                Name = operation.Name,
                Description = operation.Description,
                OperationType = operation.OperationType,
                TestUserId = operation.TestUserId,
                SequenceOrder = operation.SequenceOrder,
                SqlStatement = operation.SqlStatement,
                ObjectName = operation.ObjectName,
                ExpectSuccess = operation.ExpectSuccess
            });
        }

        // Clone template parameters
        foreach (var parameter in originalWorkflow.Parameters)
        {
            clonedWorkflow.Parameters.Add(new TemplateParameter
            {
                Name = parameter.Name,
                Description = parameter.Description,
                DefaultValue = parameter.DefaultValue
            });
        }

        await _dbSet.AddAsync(clonedWorkflow);
        await _dbContext.SaveChangesAsync();

        return clonedWorkflow;
    }

    public async Task<TestWorkflow> CreateFromTemplateAsync(Guid templateId, string newName, Dictionary<string, string> parameterValues)
    {
        var template = await _dbSet
            .Include(w => w.Operations)
            .Include(w => w.Parameters)
            .FirstOrDefaultAsync(w => w.Id == templateId && w.IsTemplate);

        if (template == null)
        {
            throw new InvalidOperationException($"Template with ID {templateId} not found");
        }

        // Create a new workflow from the template
        var newWorkflow = await CloneWorkflowAsync(templateId, newName);

        // Apply parameter values to SQL statements and other fields
        foreach (var operation in newWorkflow.Operations)
        {
            if (!string.IsNullOrEmpty(operation.SqlStatement))
            {
                foreach (var param in parameterValues)
                {
                    operation.SqlStatement = operation.SqlStatement.Replace($"{{{{param.{param.Key}}}}}", param.Value);
                }
            }

            if (!string.IsNullOrEmpty(operation.ObjectName))
            {
                foreach (var param in parameterValues)
                {
                    operation.ObjectName = operation.ObjectName.Replace($"{{{{param.{param.Key}}}}}", param.Value);
                }
            }
        }

        await _dbContext.SaveChangesAsync();
        return newWorkflow;
    }

    public override async Task<TestWorkflow?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(w => w.Operations)
            .Include(w => w.Parameters)
            .Include(w => w.DatabaseConnection)
            .FirstOrDefaultAsync(w => w.Id == id);
    }

    public override async Task<IReadOnlyList<TestWorkflow>> GetAllAsync()
    {
        return await _dbSet
            .Include(w => w.Operations)
            .Include(w => w.DatabaseConnection)
            .ToListAsync();
    }
}
