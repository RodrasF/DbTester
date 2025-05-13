import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userService } from "@/services/userService";
import {
  type TestUser,
  type DatabasePermission,
  DatabasePermissions,
} from "@/services/userTypes";
import { Badge } from "@/components/ui/badge";
import { useToaster } from "@/hooks/useToaster";
import { UserDialog } from "./UserDialog";

export function UsersPage() {
  const [users, setUsers] = useState<TestUser[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<TestUser> | undefined>(
    undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToaster();

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getAllUsers();
      if (response.success) {
        setUsers(response.users);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load users. Please try again later.");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setCurrentUser(undefined);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: TestUser) => {
    setCurrentUser({
      ...user,
      password: "", // Don't pass password for editing
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await userService.deleteUser(id);
      if (response.success) {
        setUsers((prev) => prev.filter((user) => user.id !== id));
        showToast({
          title: "User Deleted",
          description: "Test user was deleted successfully",
          variant: "default",
          duration: 3000,
        });
      } else {
        showToast({
          title: "Error",
          description: response.message || "Failed to delete user",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to delete user. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Error deleting user:", err);
    }
  };

  const handleValidateUser = async (id: string) => {
    try {
      const response = await userService.validateUser({ id });

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? {
                ...user,
                isValid: response.isValid,
                lastValidationDate: new Date().toISOString(),
              }
            : user
        )
      );

      if (response.isValid) {
        showToast({
          title: "Validation Successful",
          description: response.message || "User has all required permissions",
          variant: "success",
          duration: 3000,
        });
      } else {
        showToast({
          title: "Validation Failed",
          description:
            response.message || "User is missing required permissions",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to validate user. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Error validating user:", err);
    }
  };

  const handleFormSubmit = async (userData: TestUser) => {
    setIsSubmitting(true);

    try {
      let response;

      if (userData.id) {
        // Update existing user
        response = await userService.updateUser(userData.id, userData);
      } else {
        // Create new user
        response = await userService.createUser(userData);
      }

      if (response.success && response.user) {
        if (userData.id) {
          // Update local state
          setUsers((prev) =>
            prev.map((u) => (u.id === userData.id ? response.user! : u))
          );
          showToast({
            title: "User Updated",
            description:
              response.message ||
              `User "${userData.username}" was updated successfully`,
            variant: "success",
            duration: 3000,
          });
        } else {
          // Add to local state
          setUsers((prev) => [...prev, response.user!]);
          showToast({
            title: "User Added",
            description:
              response.message ||
              `User "${userData.username}" was added successfully`,
            variant: "success",
            duration: 3000,
          });
        }

        setIsDialogOpen(false);
      } else {
        showToast({
          title: "Error",
          description: response.message || "Failed to save user",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to save user. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Error saving user:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for displaying permissions
  const getPermissionBadges = (permissions: DatabasePermission[]) => {
    // Group permissions by category
    const basicPermissions = ["SELECT", "INSERT", "UPDATE", "DELETE"];
    const adminPermissions = ["CREATE", "ALTER", "DROP", "TRUNCATE"];

    // Count how many of each category
    const basicCount = permissions.filter((p) =>
      basicPermissions.includes(p)
    ).length;
    const adminCount = permissions.filter((p) =>
      adminPermissions.includes(p)
    ).length;
    const otherCount = permissions.length - basicCount - adminCount;

    return (
      <div className="flex flex-wrap gap-1">
        {basicCount > 0 && (
          <Badge variant="outline" className="bg-blue-50">
            {basicCount} Basic
          </Badge>
        )}
        {adminCount > 0 && (
          <Badge variant="outline" className="bg-amber-50">
            {adminCount} Admin
          </Badge>
        )}
        {otherCount > 0 && (
          <Badge variant="outline" className="bg-gray-50">
            {otherCount} Other
          </Badge>
        )}
        {permissions.includes(DatabasePermissions.ALL) && (
          <Badge variant="outline" className="bg-red-50">
            ALL
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Test Users</h1>
        <Button onClick={handleAddUser}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchUsers}
          >
            Retry
          </Button>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No test users found.</p>
          <Button onClick={handleAddUser} variant="outline">
            Add Your First Test User
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{user.username}</CardTitle>
                    <CardDescription>{user.connectionName}</CardDescription>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs flex items-center ${
                      user.isValid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isValid ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" /> Valid
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" /> Invalid
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.description && (
                    <p className="text-sm text-muted-foreground">
                      {user.description}
                    </p>
                  )}
                  <div>
                    <h4 className="text-sm font-medium mb-1">Permissions:</h4>
                    {getPermissionBadges(user.permissions)}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last validated:{" "}
                    {user.lastValidationDate
                      ? new Date(user.lastValidationDate).toLocaleString()
                      : "Never"}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleValidateUser(user.id!)}
                    >
                      Validate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteUser(user.id!)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isDialogOpen && (
        <UserDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          user={currentUser}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
