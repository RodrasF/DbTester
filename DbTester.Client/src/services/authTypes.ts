export interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  validationErrors?: string[];
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  validationErrors?: string[];
}

export interface UserResponse {
  success: boolean;
  message: string;
  user?: User;
}
