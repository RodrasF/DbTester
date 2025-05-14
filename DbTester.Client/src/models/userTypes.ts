// Common types for users management
export interface TestUser {
  id?: string;
  username: string;
  password?: string; // Optional as we don't return passwords from API
  connectionId: string;
  connectionName?: string; // For display purposes
  description?: string;
  permissions: DatabasePermission[];
  createdAt?: string;
  modifiedAt?: string;
  isValid?: boolean;
  lastValidationDate?: string;
}

export const DatabasePermissions = {
  SELECT: "SELECT",
  INSERT: "INSERT",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  CREATE: "CREATE",
  ALTER: "ALTER",
  DROP: "DROP",
  TRUNCATE: "TRUNCATE",
  REFERENCES: "REFERENCES",
  TRIGGER: "TRIGGER",
  USAGE: "USAGE",
  CONNECT: "CONNECT",
  TEMPORARY: "TEMPORARY",
  EXECUTE: "EXECUTE",
  ALL: "ALL",
} as const;

export type DatabasePermission = keyof typeof DatabasePermissions;

export interface UserListResponse {
  success: boolean;
  message: string;
  users: TestUser[];
}

export interface UserResponse {
  success: boolean;
  message: string;
  user?: TestUser;
}

export interface ValidateUserRequest {
  id: string;
}

export interface ValidateUserResponse {
  success: boolean;
  message: string;
  isValid: boolean;
  details?: {
    grantedPermissions: DatabasePermission[];
    missingPermissions: DatabasePermission[];
  };
}
