import axios from "axios";
import { TOKEN_KEY, USER_KEY } from "./authService";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Add request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add interceptors for handling errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message || "An unexpected error occurred";
    console.error("API Error:", errorMessage);

    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // If we're not on the login page and the token is expired, redirect to login
      if (window.location.pathname !== "/login") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = "/login?expired=true";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
