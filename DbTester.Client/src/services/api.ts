import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Default API URL for development
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
    const token = localStorage.getItem("dbtester_token");
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
        localStorage.removeItem("dbtester_token");
        localStorage.removeItem("dbtester_user");
        window.location.href = "/login?expired=true";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
