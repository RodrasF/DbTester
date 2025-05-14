import api, { type ApiResponse } from "./api";
import {
  type TestWorkflow,
  type WorkflowListResponse,
  type WorkflowResponse,
  type TestRunResponse,
  type TestRunListResponse,
} from "../models/workflowTypes";

export const workflowService = {
  // Get all workflows
  async getAllWorkflows(): Promise<WorkflowListResponse> {
    try {
      const response = await api.get<WorkflowListResponse>("/workflows");
      return response.data;
    } catch (error) {
      console.error("Error fetching workflows:", error);
      // Return empty list with error message
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Error fetching workflows",
        workflows: [],
      };
    }
  },
  // Get a specific workflow by ID
  async getWorkflow(id: string): Promise<WorkflowResponse> {
    try {
      const response = await api.get<WorkflowResponse>(`/workflows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching workflow ${id}:`, error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Error fetching workflow ${id}`,
      };
    }
  },
  // Create a new workflow
  async createWorkflow(workflow: TestWorkflow): Promise<WorkflowResponse> {
    try {
      const response = await api.post<WorkflowResponse>("/workflows", workflow);
      return response.data;
    } catch (error) {
      console.error("Error creating workflow:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Error creating workflow",
      };
    }
  },
  // Update an existing workflow
  async updateWorkflow(
    id: string,
    workflow: TestWorkflow
  ): Promise<WorkflowResponse> {
    try {
      const response = await api.put<WorkflowResponse>(
        `/workflows/${id}`,
        workflow
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating workflow ${id}:`, error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Error updating workflow ${id}`,
      };
    }
  },
  // Delete a workflow
  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/workflows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting workflow ${id}:`, error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Error deleting workflow ${id}`,
      };
    }
  },
  // Execute a workflow
  async executeWorkflow(
    workflowId: string,
    connectionId: string,
    userId: string,
    parameters?: Record<string, string>
  ): Promise<TestRunResponse> {
    try {
      const response = await api.post<TestRunResponse>(
        `/workflows/${workflowId}/execute`,
        {
          connectionId,
          userId,
          parameters,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error executing workflow ${workflowId}:`, error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Error executing workflow ${workflowId}`,
      };
    }
  }, // Get all test runs
  async getTestRuns(): Promise<TestRunListResponse> {
    try {
      const response = await api.get<TestRunListResponse>("/testruns");
      return response.data;
    } catch (error) {
      console.error("Error fetching test runs:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Error fetching test runs",
        testRuns: [],
      };
    }
  }, // Get a specific test run by ID
  async getTestRun(id: string): Promise<TestRunResponse> {
    try {
      const response = await api.get<TestRunResponse>(`/testruns/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching test run ${id}:`, error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Error fetching test run ${id}`,
      };
    }
  },
};
