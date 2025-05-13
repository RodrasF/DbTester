// Common types for workflow management
export const TestOperationTypes = {
  SELECT: "SELECT",
  INSERT: "INSERT",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  CREATE_TABLE: "CREATE_TABLE",
  ALTER_TABLE: "ALTER_TABLE",
  DROP_TABLE: "DROP_TABLE",
  CREATE_INDEX: "CREATE_INDEX",
  CREATE_VIEW: "CREATE_VIEW",
  EXECUTE_PROCEDURE: "EXECUTE_PROCEDURE",
  CUSTOM_SQL: "CUSTOM_SQL",
} as const;

export type TestOperationType = keyof typeof TestOperationTypes;

export interface TestOperation {
  id?: string;
  name: string;
  description?: string;
  operationType: TestOperationType;
  targetObject?: string; // table, view, etc.
  sqlStatement: string;
  expectedResult: string;
  order: number;
}

export interface TemplateParameter {
  id?: string;
  name: string;
  description?: string;
  defaultValue?: string;
  isRequired: boolean;
}

export interface TestWorkflow {
  id?: string;
  name: string;
  description?: string;
  isTemplate: boolean;
  connectionId?: string;
  connectionName?: string;
  userId?: string;
  username?: string;
  operations: TestOperation[];
  parameters: TemplateParameter[];
  createdAt?: string;
  modifiedAt?: string;
}

export interface TestRun {
  id?: string;
  workflowId: string;
  workflowName?: string;
  connectionId: string;
  connectionName?: string;
  userId: string;
  username?: string;
  startTime: string;
  endTime?: string;
  isSuccessful?: boolean;
  operationResults: TestOperationResult[];
}

export interface TestOperationResult {
  operationId: string;
  operationName?: string;
  isSuccessful: boolean;
  executionTime: number; // ms
  resultMessage?: string;
  errorMessage?: string;
  actualResult?: string;
}

export interface WorkflowListResponse {
  success: boolean;
  message: string;
  workflows: TestWorkflow[];
}

export interface WorkflowResponse {
  success: boolean;
  message: string;
  workflow?: TestWorkflow;
}

export interface TestRunResponse {
  success: boolean;
  message: string;
  testRun?: TestRun;
}

export interface TestRunListResponse {
  success: boolean;
  message: string;
  testRuns: TestRun[];
}
