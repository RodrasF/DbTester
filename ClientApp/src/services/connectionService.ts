import api, { type ApiResponse } from "./api";

// Types
export interface DatabaseConnection {
  id?: string;
  name: string;
  server: string;
  port: number;
  databaseName: string;
  username: string;
  password?: string; // Optional as we don't return passwords from API
  maxPoolSize: number;
  minPoolSize: number;
  connectionTimeout: number;
  isConnectionValid: boolean;
  lastConnectionTest?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface ConnectionListResponse {
  success: boolean;
  message: string;
  connections: DatabaseConnection[];
}

export interface ConnectionResponse {
  success: boolean;
  message: string;
  connection?: DatabaseConnection;
}

export interface TestConnectionRequest {
  id?: string;
  server?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  password?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  isConnectionValid: boolean;
}

// API functions
export const connectionService = {
  // Get all connections
  async getAllConnections(): Promise<ConnectionListResponse> {
    try {
      const response = await api.get<ConnectionListResponse>("/connections");
      return response.data;
    } catch (error) {
      console.error("Error fetching connections:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Error fetching connections",
        connections: [],
      };
    }
  },
  // Get a specific connection by ID
  async getConnection(id: string): Promise<ConnectionResponse> {
    try {
      const response = await api.get<ConnectionResponse>(`/connections/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching connection ${id}:`, error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Error fetching connection ${id}`,
      };
    }
  },
  // Create a new connection
  async createConnection(
    connection: DatabaseConnection
  ): Promise<ConnectionResponse> {
    try {
      const response = await api.post<ConnectionResponse>(
        "/connections",
        connection
      );
      return response.data;
    } catch (error) {
      console.error("Error creating connection:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Error creating connection",
      };
    }
  },
  // Update an existing connection
  async updateConnection(
    id: string,
    connection: DatabaseConnection
  ): Promise<ConnectionResponse> {
    try {
      const response = await api.put<ConnectionResponse>(
        `/connections/${id}`,
        connection
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating connection ${id}:`, error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Error updating connection ${id}`,
      };
    }
  },
  // Delete a connection
  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(
        `/connections/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting connection ${id}:`, error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : `Error deleting connection ${id}`,
      };
    }
  },
  // Test a connection
  async testConnection(
    request: TestConnectionRequest
  ): Promise<TestConnectionResponse> {
    try {
      const response = await api.post<TestConnectionResponse>(
        "/connections/test",
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error testing connection:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Error testing connection",
        isConnectionValid: false,
      };
    }
  },
};
