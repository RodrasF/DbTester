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
  type TestUser,
  type UserPermission,
} from "@/models/userTypes";
import {
  connectionService,
  type DatabaseConnection,
} from "@/services/connectionService";
import { Label } from "@/components/ui/label";
import { PermissionItem } from "@/components/user/PermissionItem";
import { toast } from "sonner";

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
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
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
      setFormData(user);
    } else {
      setFormData({});
    }

    setIsUpdatingPassword(false);
  }, [user, open]);

  const loadConnections = async () => {
    setConnectionsLoading(true);
    try {
      const response = await connectionService.getAllConnections();
      if (response.success) {
        setConnections(response.connections);
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

    // Create a copy of the current permissions
    let updatedPermissions = [...currentPermissions];

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

  const openPasswordUpdate = () => {
    setIsUpdatingPassword(true);
    // Empty password is a valid value
    setFormData({ ...formData, password: "" });
  };

  const cancelPasswordUpdate = () => {
    setIsUpdatingPassword(false);
    setFormData({ ...formData, password: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = ["connectionId", "username"];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof TestUser]
    );

    if (missingFields.length > 0) {
      toast.error("Oops!", {
        description: `Please fill in all required fields: ${missingFields.join(
          ", "
        )}`,
      });
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
              <Label htmlFor="connectionId" className="text-left">
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
                    <SelectItem key={connection.id} value={connection.id ?? ""}>
                      {connection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-left">
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
              <Label htmlFor="password" className="text-left">
                Password
              </Label>
              {!isEditing ? (
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder={"Enter password"}
                />
              ) : isUpdatingPassword ? (
                <div className="col-span-3 grid grid-cols-4 items-center gap-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password || ""}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder={"Enter new password"}
                  />
                  <Button
                    type="button"
                    variant="default"
                    className="h-8 w-8"
                    onClick={cancelPasswordUpdate}
                  >
                    X
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  onClick={openPasswordUpdate}
                >
                  Edit Password
                </Button>
              )}
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-left">
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
              <Label className="text-left">Permissions</Label>
              <div className="col-span-3 space-y-4">
                {" "}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Basic Permissions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {" "}
                    {permissionGroups.basic.map((permissionType) => {
                      const existingPermission =
                        formData.expectedPermissions?.find(
                          (p) => p.permission === permissionType
                        );
                      const checked = Boolean(existingPermission?.isGranted);

                      return (
                        <PermissionItem
                          key={permissionType}
                          permission={permissionType}
                          checked={checked}
                          objectName={existingPermission?.objectName}
                          onChange={handlePermissionChange}
                          disabled={false}
                          requiresObjectName={false}
                        />
                      );
                    })}
                  </div>
                </div>{" "}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Schema Permissions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {" "}
                    {permissionGroups.schema.map((permissionType) => {
                      const existingPermission =
                        formData.expectedPermissions?.find(
                          (p) => p.permission === permissionType
                        );
                      const checked = Boolean(existingPermission?.isGranted);

                      return (
                        <PermissionItem
                          key={permissionType}
                          permission={permissionType}
                          checked={checked}
                          objectName={existingPermission?.objectName}
                          onChange={handlePermissionChange}
                          disabled={false}
                          requiresObjectName={false}
                        />
                      );
                    })}
                  </div>
                </div>{" "}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Other Permissions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {" "}
                    {permissionGroups.other.map((permissionType) => {
                      const existingPermission =
                        formData.expectedPermissions?.find(
                          (p) => p.permission === permissionType
                        );
                      const checked = Boolean(existingPermission?.isGranted);

                      return (
                        <PermissionItem
                          key={permissionType}
                          permission={permissionType}
                          checked={checked}
                          objectName={existingPermission?.objectName}
                          onChange={handlePermissionChange}
                          disabled={false}
                          requiresObjectName={false}
                        />
                      );
                    })}
                  </div>{" "}
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
