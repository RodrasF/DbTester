import { AuthContext, type AuthContextType } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import type { User } from "@/models/authTypes";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initialize authentication on component mount
    authService.initializeAuth();

    // Check if token is valid and fetch user data
    const validateAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            // Token may be expired or invalid
            authService.logout();
            setUser(null);
          }
        } catch {
          // Token validation failed
          authService.logout();
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    validateAuth();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await authService.login({ username, password });

      if (response.success && response.user) {
        setUser(response.user);
        toast.success("Login successful", {
          description: `Welcome back, ${response.user.username}!`,
          duration: 3000,
        });
        return true;
      } else {
        toast.error("Login failed", {
          description: response.message || "Invalid username or password",
          duration: 5000,
        });
        return false;
      }
    } catch (error) {
      toast.error("Login error", {
        description: "An unexpected error occurred. Please try again.",
        duration: 5000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (
    username: string,
    password: string,
    email: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        username,
        password,
        email,
      });

      if (response.success && response.user) {
        setUser(response.user);
        toast.success("Registration successful", {
          description: `Welcome, ${response.user.username}!`,
          duration: 3000,
        });
        return true;
      } else {
        toast.error("Registration failed", {
          description: response.message || "Unable to register account",
          duration: 5000,
        });
        return false;
      }
    } catch (error) {
      toast.error("Registration error", {
        description: "An unexpected error occurred. Please try again.",
        duration: 5000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast("Logged out", {
      description: "You have been successfully logged out",
      duration: 3000,
    });
  };

  const hasRole = (role: string): boolean => {
    return !!user && user.role === role;
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
