import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DatabasePermissions,
  type DatabasePermission,
  type TestUser,
} from "@/models/userTypes";
import { connectionService } from "@/services/connectionService";
import { Label } from "@/components/ui/label";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: Partial<TestUser>;
  onSubmit: (data: TestUser) => void;
  isSubmitting?: boolean;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isSubmitting = false,
}: UserDialogProps) {
  const [formData, setFormData] = useState<Partial<TestUser>>(user || {});
  const [connections, setConnections] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const isEditing = Boolean(user?.id);

  // Load connections when dialog opens
  useEffect(() => {
    if (open) {
      loadConnections();
    }
  }, [open]);

  // Reset form when user changes or dialog opens/closes
  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: "" });
    } else {
      setFormData({ permissions: [] });
    }
  }, [user, open]);

  const loadConnections = async () => {
    setConnectionsLoading(true);
    try {
      const response = await connectionService.getAllConnections();
      if (response.success) {
        setConnections(
          response.connections.map((conn) => ({
            id: conn.id!,
            name: conn.name,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load connections", error);
    } finally {
      setConnectionsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleConnectionChange = (value: string) => {
    const connection = connections.find((c) => c.id === value);
    setFormData({
      ...formData,
      connectionId: value,
      connectionName: connection?.name,
    });
  };

  const handlePermissionChange = (
    permission: DatabasePermission,
    checked: boolean
  ) => {
    const currentPermissions = formData.permissions || [];

    // Special handling for ALL permission
    if (permission === DatabasePermissions.ALL && checked) {
      // If checking ALL, clear other permissions
      setFormData({ ...formData, permissions: [DatabasePermissions.ALL] });
      return;
    }

    // If checking any permission other than ALL, remove ALL if it exists
    let updatedPermissions: DatabasePermission[] = [...currentPermissions];

    if (permission !== DatabasePermissions.ALL) {
      // Remove ALL if it's in the list
      updatedPermissions = updatedPermissions.filter(
        (p) => p !== DatabasePermissions.ALL
      );
    }

    // Add or remove the permission
    if (checked) {
      updatedPermissions.push(permission);
    } else {
      updatedPermissions = updatedPermissions.filter((p) => p !== permission);
    }

    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    const requiredFields = ["username", "connectionId", "permissions"];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof TestUser]
    );

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Need to add password check for new users
    if (!isEditing && !formData.password) {
      alert("Password is required for new users");
      return;
    }

    // If array is empty, don't submit
    if (!formData.permissions || formData.permissions.length === 0) {
      alert("Please select at least one permission");
      return;
    }

    onSubmit(formData as TestUser);
  };

  // Group permissions for UI organization
  const permissionGroups = {
    basic: [
      DatabasePermissions.SELECT,
      DatabasePermissions.INSERT,
      DatabasePermissions.UPDATE,
      DatabasePermissions.DELETE,
    ],
    schema: [
      DatabasePermissions.CREATE,
      DatabasePermissions.ALTER,
      DatabasePermissions.DROP,
      DatabasePermissions.TRUNCATE,
      DatabasePermissions.REFERENCES,
    ],
    other: [
      DatabasePermissions.TRIGGER,
      DatabasePermissions.USAGE,
      DatabasePermissions.CONNECT,
      DatabasePermissions.TEMPORARY,
      DatabasePermissions.EXECUTE,
    ],
    special: [DatabasePermissions.ALL],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Test User" : "Add Test User"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update your test user details below."
                : "Enter test user details below to add a new database user for testing."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username*
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username || ""}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="test_user"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password{!isEditing ? "*" : ""}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password || ""}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder={
                  isEditing ? "Leave blank to keep unchanged" : "Enter password"
                }
                required={!isEditing}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="connectionId" className="text-right">
                Database Connection*
              </Label>
              <Select
                value={formData.connectionId}
                onValueChange={handleConnectionChange}
                disabled={connectionsLoading}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a connection" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((connection) => (
                    <SelectItem key={connection.id} value={connection.id}>
                      {connection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Description of this test user"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Permissions*</Label>
              <div className="col-span-3 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Basic Permissions</h4>
                  <div className="grid grid-cols-2">
                    {permissionGroups.basic.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`permission-${permission}`}
                          checked={formData.permissions?.includes(permission)}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(
                              permission,
                              checked as boolean
                            )
                          }
                          disabled={formData.permissions?.includes(
                            DatabasePermissions.ALL
                          )}
                        />
                        <label
                          htmlFor={`permission-${permission}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Schema Permissions</h4>
                  <div className="grid grid-cols-2">
                    {permissionGroups.schema.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`permission-${permission}`}
                          checked={formData.permissions?.includes(permission)}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(
                              permission,
                              checked as boolean
                            )
                          }
                          disabled={formData.permissions?.includes(
                            DatabasePermissions.ALL
                          )}
                        />
                        <label
                          htmlFor={`permission-${permission}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Other Permissions</h4>
                  <div className="grid grid-cols-2">
                    {permissionGroups.other.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`permission-${permission}`}
                          checked={formData.permissions?.includes(permission)}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(
                              permission,
                              checked as boolean
                            )
                          }
                          disabled={formData.permissions?.includes(
                            DatabasePermissions.ALL
                          )}
                        />
                        <label
                          htmlFor={`permission-${permission}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="permission-ALL"
                      checked={formData.permissions?.includes(
                        DatabasePermissions.ALL
                      )}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(
                          DatabasePermissions.ALL,
                          checked as boolean
                        )
                      }
                    />
                    <label
                      htmlFor="permission-ALL"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      ALL PRIVILEGES
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Grants all permissions to this user
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update User"
                : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
