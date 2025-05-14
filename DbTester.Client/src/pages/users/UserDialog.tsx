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
  type UserPermission,
} from "@/models/userTypes";
import { connectionService } from "@/services/connectionService";
import { Label } from "@/components/ui/label";
import { PermissionItem } from "@/components/user/PermissionItem";

// Define which permissions require object names
const permissionsRequiringObjectNames: DatabasePermission[] = [
  DatabasePermissions.SELECT,
  DatabasePermissions.INSERT,
  DatabasePermissions.UPDATE,
  DatabasePermissions.DELETE,
  DatabasePermissions.EXECUTE,
  DatabasePermissions.TRUNCATE,
];

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
      setFormData({ expectedPermissions: [] });
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
  const handlePermissionChange = (updatedPermission: UserPermission) => {
    const currentPermissions = formData.expectedPermissions || [];

    // Special handling for ALL permission
    if (
      updatedPermission.permission === DatabasePermissions.ALL &&
      updatedPermission.isGranted
    ) {
      // If adding ALL, clear other permissions
      setFormData({
        ...formData,
        expectedPermissions: [
          {
            permission: DatabasePermissions.ALL,
            isGranted: true,
            objectName: null,
          },
        ],
      });
      return;
    }

    // Filter out ALL permission if adding other permission
    let updatedPermissions = [...currentPermissions];
    if (updatedPermission.permission !== DatabasePermissions.ALL) {
      updatedPermissions = updatedPermissions.filter(
        (p) => p.permission !== DatabasePermissions.ALL
      );
    }

    // Add or update permission
    if (updatedPermission.isGranted) {
      // Remove existing permission if present
      updatedPermissions = updatedPermissions.filter(
        (p) => p.permission !== updatedPermission.permission
      );
      // Add the new/updated permission
      updatedPermissions.push(updatedPermission);
    } else {
      // Remove permission if isGranted is false
      updatedPermissions = updatedPermissions.filter(
        (p) => p.permission !== updatedPermission.permission
      );
    }

    setFormData({ ...formData, expectedPermissions: updatedPermissions });
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
    if (
      !formData.expectedPermissions ||
      formData.expectedPermissions.length === 0
    ) {
      alert("Please select at least one permission");
      return;
    }

    // Check if object names are required for any selected permissions
    const missingObjectNames = formData.expectedPermissions.filter(
      (p) =>
        permissionsRequiringObjectNames.includes(p.permission) &&
        p.isGranted &&
        (!p.objectName || p.objectName.trim() === "")
    );

    if (missingObjectNames.length > 0) {
      const missingPermNames = missingObjectNames
        .map((p) => p.permission)
        .join(", ");
      alert(
        `Please provide object names for the following permissions: ${missingPermNames}`
      );
      return;
    }

    // Send user data directly without permissionDetails
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
                {" "}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Basic Permissions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {permissionGroups.basic.map((permissionType) => {
                      const existingPermission =
                        formData.expectedPermissions?.find(
                          (p) => p.permission === permissionType
                        );
                      const checked = Boolean(existingPermission?.isGranted);
                      const hasAllPermission =
                        formData.expectedPermissions?.some(
                          (p) =>
                            p.permission === DatabasePermissions.ALL &&
                            p.isGranted
                        );

                      return (
                        <PermissionItem
                          key={permissionType}
                          permission={permissionType}
                          checked={checked}
                          objectName={existingPermission?.objectName}
                          onChange={handlePermissionChange}
                          disabled={Boolean(hasAllPermission)}
                          requiresObjectName={permissionsRequiringObjectNames.includes(
                            permissionType
                          )}
                        />
                      );
                    })}
                  </div>
                </div>{" "}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Schema Permissions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {permissionGroups.schema.map((permissionType) => {
                      const existingPermission =
                        formData.expectedPermissions?.find(
                          (p) => p.permission === permissionType
                        );
                      const checked = Boolean(existingPermission?.isGranted);
                      const hasAllPermission =
                        formData.expectedPermissions?.some(
                          (p) =>
                            p.permission === DatabasePermissions.ALL &&
                            p.isGranted
                        );

                      return (
                        <PermissionItem
                          key={permissionType}
                          permission={permissionType}
                          checked={checked}
                          objectName={existingPermission?.objectName}
                          onChange={handlePermissionChange}
                          disabled={Boolean(hasAllPermission)}
                          requiresObjectName={permissionsRequiringObjectNames.includes(
                            permissionType
                          )}
                        />
                      );
                    })}
                  </div>
                </div>{" "}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Other Permissions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {permissionGroups.other.map((permissionType) => {
                      const existingPermission =
                        formData.expectedPermissions?.find(
                          (p) => p.permission === permissionType
                        );
                      const checked = Boolean(existingPermission?.isGranted);
                      const hasAllPermission =
                        formData.expectedPermissions?.some(
                          (p) =>
                            p.permission === DatabasePermissions.ALL &&
                            p.isGranted
                        );

                      return (
                        <PermissionItem
                          key={permissionType}
                          permission={permissionType}
                          checked={checked}
                          objectName={existingPermission?.objectName}
                          onChange={handlePermissionChange}
                          disabled={Boolean(hasAllPermission)}
                          requiresObjectName={permissionsRequiringObjectNames.includes(
                            permissionType
                          )}
                        />
                      );
                    })}
                  </div>
                </div>{" "}
                <div className="pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="permission-ALL"
                      checked={formData.expectedPermissions?.some(
                        (p) =>
                          p.permission === DatabasePermissions.ALL &&
                          p.isGranted
                      )}
                      onCheckedChange={(checked) =>
                        handlePermissionChange({
                          permission: DatabasePermissions.ALL,
                          objectName: null,
                          isGranted: checked === true,
                        })
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
                    Grants all permissions to this user (no object names
                    required)
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
