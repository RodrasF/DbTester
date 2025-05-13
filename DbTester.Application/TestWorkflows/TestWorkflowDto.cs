using DbTester.Application.Common;
using DbTester.Domain.Enums;

namespace DbTester.Application.TestWorkflows;

public class TestWorkflowDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid DatabaseConnectionId { get; set; }
    public string DatabaseConnectionName { get; set; } = string.Empty;
    public List<TestOperationDto> Operations { get; set; } = new List<TestOperationDto>();
    public bool IsTemplate { get; set; }
    public List<TemplateParameterDto> Parameters { get; set; } = new List<TemplateParameterDto>();
    public DateTime CreatedAt { get; set; }
    public DateTime? ModifiedAt { get; set; }
}

public class TestOperationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TestOperationType OperationType { get; set; }
    public Guid TestUserId { get; set; }
    public string TestUserName { get; set; } = string.Empty;
    public int SequenceOrder { get; set; }
    public string? SqlStatement { get; set; }
    public string? ObjectName { get; set; }
    public bool ExpectSuccess { get; set; } = true;
}

public class TemplateParameterDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DefaultValue { get; set; } = string.Empty;
    public string? Value { get; set; }
}

public class CreateTestWorkflowRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid DatabaseConnectionId { get; set; }
    public bool IsTemplate { get; set; }
    public List<CreateTestOperationRequest> Operations { get; set; } = new List<CreateTestOperationRequest>();
    public List<CreateTemplateParameterRequest> Parameters { get; set; } = new List<CreateTemplateParameterRequest>();
}

public class CreateTestOperationRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TestOperationType OperationType { get; set; }
    public Guid TestUserId { get; set; }
    public int SequenceOrder { get; set; }
    public string? SqlStatement { get; set; }
    public string? ObjectName { get; set; }
    public bool ExpectSuccess { get; set; } = true;
}

public class CreateTemplateParameterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DefaultValue { get; set; } = string.Empty;
}

public class UpdateTestWorkflowRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid DatabaseConnectionId { get; set; }
    public bool IsTemplate { get; set; }
    public List<TestOperationDto> Operations { get; set; } = new List<TestOperationDto>();
    public List<TemplateParameterDto> Parameters { get; set; } = new List<TemplateParameterDto>();
}

public class CloneWorkflowRequest
{
    public Guid SourceWorkflowId { get; set; }
    public string NewName { get; set; } = string.Empty;
    public string? NewDescription { get; set; }
}

public class CreateFromTemplateRequest
{
    public Guid TemplateId { get; set; }
    public string NewName { get; set; } = string.Empty;
    public string? NewDescription { get; set; }
    public Dictionary<string, string> ParameterValues { get; set; } = new Dictionary<string, string>();
}

public class TestWorkflowResponse : BaseResponse
{
    public TestWorkflowDto? Workflow { get; set; }
}

public class TestWorkflowListResponse : BaseResponse
{
    public List<TestWorkflowDto> Workflows { get; set; } = new List<TestWorkflowDto>();
}