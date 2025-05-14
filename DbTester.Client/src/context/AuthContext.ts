import { createContext } from "react";
import type { User } from "../services/authTypes";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    username: string,
    password: string,
    email: string
  ) => Promise<boolean>;
  hasRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  register: async () => false,
  hasRole: () => false,
});
