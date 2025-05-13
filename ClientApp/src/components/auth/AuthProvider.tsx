import { AuthContext, type AuthContextType } from "@/context/AuthContext";
import { useToaster } from "@/hooks/useToaster";
import { authService } from "@/services/authService";
import type { User } from "@/services/authTypes";
import { useEffect, useState, type ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToaster();

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
        showToast({
          title: "Login successful",
          description: `Welcome back, ${response.user.username}!`,
          variant: "success",
          duration: 3000,
        });
        return true;
      } else {
        showToast({
          title: "Login failed",
          description: response.message || "Invalid username or password",
          variant: "destructive",
          duration: 5000,
        });
        return false;
      }
    } catch (error) {
      showToast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
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
    email: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await authService.register({
        username,
        password,
        email,
        firstName,
        lastName,
      });

      if (response.success && response.user) {
        setUser(response.user);
        showToast({
          title: "Registration successful",
          description: `Welcome, ${response.user.username}!`,
          variant: "success",
          duration: 3000,
        });
        return true;
      } else {
        showToast({
          title: "Registration failed",
          description: response.message || "Unable to register account",
          variant: "destructive",
          duration: 5000,
        });
        return false;
      }
    } catch (error) {
      showToast({
        title: "Registration error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
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
    showToast({
      title: "Logged out",
      description: "You have been successfully logged out",
      variant: "default",
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
