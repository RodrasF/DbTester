import { isAxiosError } from "axios";
import api, { type ApiResponse } from "./api";
import {
  type TestUser,
  type UserListResponse,
  type UserResponse,
  type ValidateUserRequest,
  type ValidateUserResponse,
} from "./userTypes";

export const userService = {
  // Get all test users
  async getAllUsers(): Promise<UserListResponse> {
    try {
      const response = await api.get<UserListResponse>("/users");
      return response.data;
    } catch (error) {
      console.error("Error fetching test users:", error);
      return {
        success: false,
        message: "Failed to fetch test users",
        users: [],
      };
    }
  },

  // Get a specific user by ID
  async getUser(id: string): Promise<UserResponse> {
    try {
      const response = await api.get<UserResponse>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching test user ${id}:`, error);
      return {
        success: false,
        message: "Failed to fetch test user",
      };
    }
  },

  // Create a new user
  async createUser(user: TestUser): Promise<UserResponse> {
    try {
      const response = await api.post<UserResponse>("/users", user);
      return response.data;
    } catch (error) {
      console.error("Error creating test user:", error);
      return {
        success: false,
        message: isAxiosError(error)
          ? error.response?.data?.message
          : error instanceof Error
          ? error.message
          : "Failed to create test user",
      };
    }
  },

  // Update an existing user
  async updateUser(id: string, user: TestUser): Promise<UserResponse> {
    try {
      const response = await api.put<UserResponse>(`/users/${id}`, user);
      return response.data;
    } catch (error) {
      console.error(`Error updating test user ${id}:`, error);
      return {
        success: false,
        message: isAxiosError(error)
          ? error.response?.data?.message
          : error instanceof Error
          ? error.message
          : "Failed to update test user",
      };
    }
  },

  // Delete a user
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting test user ${id}:`, error);
      return {
        success: false,
        message: isAxiosError(error)
          ? error.response?.data?.message
          : error instanceof Error
          ? error.message
          : "Failed to delete test user",
      };
    }
  },

  // Validate a user's database credentials
  async validateUser(
    request: ValidateUserRequest
  ): Promise<ValidateUserResponse> {
    try {
      const response = await api.post<ValidateUserResponse>(
        "/users/validate",
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error validating user:", error);
      return {
        success: false,
        message: isAxiosError(error)
          ? error.response?.data?.message
          : error instanceof Error
          ? error.message
          : "Failed to validate user",
        isValid: false,
        details: {
          grantedPermissions: [],
          missingPermissions: [],
        },
      };
    }
  },

  // Get users by connection ID
  async getUsersByConnection(connectionId: string): Promise<UserListResponse> {
    try {
      const response = await api.get<UserListResponse>(
        `/connections/${connectionId}/users`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching users for connection ${connectionId}:`,
        error
      );
      return {
        success: false,
        message: isAxiosError(error)
          ? error.response?.data?.message
          : error instanceof Error
          ? error.message
          : `Error fetching users for connection ${connectionId}`,
        users: [],
      };
    }
  },
};
