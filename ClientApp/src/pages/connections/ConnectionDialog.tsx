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
import { type DatabaseConnection } from "@/services/connectionService";

// Extend connection type to ensure password is required for new connections
export type ConnectionFormData = DatabaseConnection & {
  password: string; // Make password required in the form
};

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection?: Partial<ConnectionFormData>;
  onSubmit: (data: ConnectionFormData) => void;
  isSubmitting?: boolean;
}

const defaultConnectionData: ConnectionFormData = {
  name: "",
  server: "",
  port: 5432,
  databaseName: "",
  username: "",
  password: "",
  maxPoolSize: 100,
  minPoolSize: 1,
  connectionTimeout: 30,
  isConnectionValid: false,
};

export function ConnectionDialog({
  open,
  onOpenChange,
  connection,
  onSubmit,
  isSubmitting = false,
}: ConnectionDialogProps) {
  const [formData, setFormData] = useState<ConnectionFormData>(
    defaultConnectionData
  );
  const isEditing = Boolean(connection?.id);

  // Reset form when connection changes or dialog opens/closes
  useEffect(() => {
    if (connection) {
      setFormData({ ...defaultConnectionData, ...connection, password: "" });
    } else {
      setFormData(defaultConnectionData);
    }
  }, [connection, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseInt(value, 10) || 0 : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Connection" : "Add New Connection"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update your database connection details below."
                : "Enter your database connection details below to add a new connection."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="My Database Connection"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="server"
                className="text-right text-sm font-medium"
              >
                Server
              </label>
              <Input
                id="server"
                name="server"
                value={formData.server}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="localhost"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="port" className="text-right text-sm font-medium">
                Port
              </label>
              <Input
                id="port"
                name="port"
                type="number"
                value={formData.port}
                onChange={handleInputChange}
                className="col-span-3"
                min={1}
                max={65535}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="databaseName"
                className="text-right text-sm font-medium"
              >
                Database
              </label>
              <Input
                id="databaseName"
                name="databaseName"
                value={formData.databaseName}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="postgres"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="username"
                className="text-right text-sm font-medium"
              >
                Username
              </label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="postgres"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="password"
                className="text-right text-sm font-medium"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder={isEditing ? "••••••••" : "Enter password"}
                required={!isEditing}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="maxPoolSize"
                className="text-right text-sm font-medium"
              >
                Max Pool Size
              </label>
              <Input
                id="maxPoolSize"
                name="maxPoolSize"
                type="number"
                value={formData.maxPoolSize}
                onChange={handleInputChange}
                className="col-span-3"
                min={1}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="minPoolSize"
                className="text-right text-sm font-medium"
              >
                Min Pool Size
              </label>
              <Input
                id="minPoolSize"
                name="minPoolSize"
                type="number"
                value={formData.minPoolSize}
                onChange={handleInputChange}
                className="col-span-3"
                min={0}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="connectionTimeout"
                className="text-right text-sm font-medium"
              >
                Timeout (sec)
              </label>
              <Input
                id="connectionTimeout"
                name="connectionTimeout"
                type="number"
                value={formData.connectionTimeout}
                onChange={handleInputChange}
                className="col-span-3"
                min={1}
              />
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
                ? "Update Connection"
                : "Add Connection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
