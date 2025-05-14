import { isAxiosError } from "axios";
import api from "./api";
import {
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
  type UserResponse,
  type User,
} from "./authTypes";

// Local storage keys
export const TOKEN_KEY = "dbtester_token";
export const USER_KEY = "dbtester_user";

export const authService = {
  // Login user
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>("/auth/login", request);

      if (response.data.success && response.data.token && response.data.user) {
        // Store token and user info in local storage
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

        // Set the token in API headers for subsequent requests
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
      }

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || "Login failed",
          validationErrors: error.response?.data?.validationErrors,
        };
      }

      console.error("Error during login:", error);
      return {
        success: false,
        message: "Login failed",
      };
    }
  },

  // Register new user
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>(
        "/auth/register",
        request
      );

      if (response.data.success && response.data.token && response.data.user) {
        // Store token and user info in local storage
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

        // Set the token in API headers for subsequent requests
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
      }

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || "Registration failed",
          validationErrors: error.response?.data?.validationErrors,
        };
      }

      console.error("Error during registration:", error);
      return {
        success: false,
        message: "Registration failed",
      };
    }
  },

  // Logout user
  logout() {
    // Remove token and user info from local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Remove the token from API headers
    delete api.defaults.headers.common["Authorization"];
  },

  // Get current user
  async getCurrentUser(): Promise<UserResponse> {
    try {
      const response = await api.get<UserResponse>("/auth/me");
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        return {
          success: false,
          message:
            error.response?.data?.message || "Failed to get current user",
        };
      }

      console.error("Error during getting current user:", error);
      return {
        success: false,
        message: "Failed to get current user",
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Get authentication token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get current user from local storage
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  // Check if user has a specific role
  hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return !!user && user.role === role;
  },

  // Initialize auth state from local storage
  initializeAuth() {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },
};
