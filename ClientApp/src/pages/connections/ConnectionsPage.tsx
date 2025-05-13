import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConnectionDialog, type ConnectionFormData } from "./ConnectionDialog";
import {
  connectionService,
  type DatabaseConnection,
} from "@/services/connectionService";
import { useToaster } from "@/hooks/useToaster";

export function ConnectionsPage() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentConnection, setCurrentConnection] = useState<
    Partial<ConnectionFormData> | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToaster();
  // Fetch connections when component mounts
  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await connectionService.getAllConnections();
      if (response.success) {
        setConnections(response.connections);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load database connections. Please try again later.");
      console.error("Error fetching connections:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddConnection = () => {
    setCurrentConnection(undefined);
    setIsDialogOpen(true);
  };

  const handleEditConnection = (connection: DatabaseConnection) => {
    setCurrentConnection({
      ...connection,
      password: "", // Don't pass password for editing
    });
    setIsDialogOpen(true);
  };
  const handleDeleteConnection = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this connection?")) {
      return;
    }

    try {
      const response = await connectionService.deleteConnection(id);
      if (response.success) {
        setConnections((prev) => prev.filter((conn) => conn.id !== id));
        showToast({
          title: "Connection Deleted",
          description: response.message || "Connection successfully deleted",
          variant: "default",
          duration: 3000,
        });
      } else {
        showToast({
          title: "Error",
          description: response.message || "Failed to delete connection",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to delete connection. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Error deleting connection:", err);
    }
  };
  const handleTestConnection = async (id: string) => {
    try {
      const response = await connectionService.testConnection({ id });

      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === id
            ? {
                ...conn,
                isConnectionValid: response.isConnectionValid,
                lastConnectionTest: new Date().toISOString(),
              }
            : conn
        )
      );

      if (response.isConnectionValid) {
        showToast({
          title: "Connection Test Successful",
          description:
            response.message || "Database connection verified successfully",
          variant: "success",
          duration: 3000,
        });
      } else {
        showToast({
          title: "Connection Test Failed",
          description: response.message || "Could not connect to database",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to test connection. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Error testing connection:", err);
    }
  };
  const handleFormSubmit = async (formData: ConnectionFormData) => {
    setIsSubmitting(true);

    try {
      let response;

      if (formData.id) {
        // Update existing connection
        response = await connectionService.updateConnection(
          formData.id,
          formData
        );
      } else {
        // Create new connection
        response = await connectionService.createConnection(formData);
      }

      if (response.success && response.connection) {
        if (formData.id) {
          // Update local state
          setConnections((prev) =>
            prev.map((conn) =>
              conn.id === formData.id ? response.connection! : conn
            )
          );
          showToast({
            title: "Connection Updated",
            description:
              response.message ||
              `Connection "${formData.name}" was updated successfully`,
            variant: "success",
            duration: 3000,
          });
        } else {
          // Add to local state
          setConnections((prev) => [...prev, response.connection!]);
          showToast({
            title: "Connection Added",
            description:
              response.message ||
              `Connection "${formData.name}" was added successfully`,
            variant: "success",
            duration: 3000,
          });
        }

        setIsDialogOpen(false);
      } else {
        showToast({
          title: "Error",
          description: response.message || "Failed to save connection",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to save connection. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Error saving connection:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Database Connections</h1>
        <Button onClick={handleAddConnection}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Connection
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <p className="text-muted-foreground">Loading connections...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchConnections}
          >
            Retry
          </Button>
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            No database connections found.
          </p>
          <Button onClick={handleAddConnection} variant="outline">
            Add Your First Connection
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{connection.name}</CardTitle>
                    <CardDescription>
                      {connection.server}:{connection.port}
                    </CardDescription>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      connection.isConnectionValid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {connection.isConnectionValid ? "Connected" : "Failed"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Database:
                    </span>
                    <span className="text-sm">{connection.databaseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Username:
                    </span>
                    <span className="text-sm">{connection.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Last Tested:
                    </span>
                    <span className="text-sm">
                      {connection.lastConnectionTest
                        ? new Date(
                            connection.lastConnectionTest
                          ).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditConnection(connection)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleTestConnection(connection.id!)}
                  >
                    Test
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteConnection(connection.id!)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConnectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        connection={currentConnection}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
