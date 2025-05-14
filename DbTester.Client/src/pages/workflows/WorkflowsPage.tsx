import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Play, FileCog } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { workflowService } from "@/services/workflowService";
import { type TestWorkflow, type TestOperation } from "@/models/workflowTypes";
import { WorkflowDialog } from "./WorkflowDialog";
import { toast } from "sonner";

export function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<TestWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<
    TestWorkflow | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch workflows when component mounts
  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workflowService.getAllWorkflows();
      if (response.success) {
        setWorkflows(response.workflows);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load workflows. Please try again later.");
      console.error("Error fetching workflows:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewWorkflow = () => {
    setCurrentWorkflow(undefined);
    setIsDialogOpen(true);
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this workflow?")) {
      return;
    }

    try {
      const response = await workflowService.deleteWorkflow(id);
      if (response.success) {
        setWorkflows((prev) => prev.filter((workflow) => workflow.id !== id));
        toast("Workflow Deleted", {
          description: "The workflow has been successfully deleted",
          duration: 3000,
        });
      } else {
        toast.error("Error", {
          description: response.message || "Failed to delete workflow",
          duration: 5000,
        });
      }
    } catch (err) {
      toast.error("Error", {
        description: "Failed to delete workflow. Please try again later.",
        duration: 5000,
      });
      console.error("Error deleting workflow:", err);
    }
  };

  const handleRunWorkflow = async (workflow: TestWorkflow) => {
    // Check if connection and user are specified for templates
    if (workflow.isTemplate && (!workflow.connectionId || !workflow.userId)) {
      toast("Configuration Required", {
        description:
          "This template workflow needs a connection and user before running",
        duration: 5000,
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await workflowService.executeWorkflow(
        workflow.id!,
        workflow.connectionId!,
        workflow.userId!
      );

      if (response.success && response.testRun) {
        toast("Workflow Executed", {
          description: response.message || "Workflow executed successfully",
          duration: 3000,
        });

        // Navigate to results page or show results in a modal
        // For now, we'll just show a toast
      } else {
        toast.error("Execution Failed", {
          description: response.message || "Failed to execute workflow",
          duration: 5000,
        });
      }
    } catch (err) {
      toast.error("Error", {
        description: "Failed to execute workflow. Please try again later.",
        duration: 5000,
      });
      console.error("Error executing workflow:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditWorkflow = (workflow: TestWorkflow) => {
    setCurrentWorkflow(workflow);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (workflowData: TestWorkflow) => {
    setIsSubmitting(true);

    try {
      let response;

      if (workflowData.id) {
        // Update existing workflow
        response = await workflowService.updateWorkflow(
          workflowData.id,
          workflowData
        );
      } else {
        // Create new workflow
        response = await workflowService.createWorkflow(workflowData);
      }

      if (response.success && response.workflow) {
        if (workflowData.id) {
          // Update local state
          setWorkflows((prev) =>
            prev.map((w) => (w.id === workflowData.id ? response.workflow! : w))
          );
          toast.success("Workflow Updated", {
            description:
              response.message ||
              `Workflow "${workflowData.name}" was updated successfully`,
            duration: 3000,
          });
        } else {
          // Add to local state
          setWorkflows((prev) => [...prev, response.workflow!]);
          toast.success("Workflow Created", {
            description:
              response.message ||
              `Workflow "${workflowData.name}" was created successfully`,
            duration: 3000,
          });
        }

        setIsDialogOpen(false);
      } else {
        toast.error("Error", {
          description: response.message || "Failed to save workflow",
          duration: 5000,
        });
      }
    } catch (err) {
      toast.error("Error", {
        description: "Failed to save workflow. Please try again later.",
        duration: 5000,
      });
      console.error("Error saving workflow:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for displaying operation counts by type
  const getOperationsSummary = (operations: TestOperation[]) => {
    const types = operations.reduce((acc, op) => {
      acc[op.operationType] = (acc[op.operationType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(types).map(([type, count]) => (
          <Badge key={type} variant="outline" className="bg-gray-50">
            {count} {type}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Test Workflows</h1>
        <Button onClick={handleNewWorkflow}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </div>

      <div className="mb-6">
        <p className="text-muted-foreground">
          Create and manage test workflows to validate database permissions and
          operations.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <p className="text-muted-foreground">Loading workflows...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchWorkflows}
          >
            Retry
          </Button>
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No test workflows found.</p>
          <Button onClick={handleNewWorkflow} variant="outline">
            Create Your First Workflow
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{workflow.name}</CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                  {workflow.isTemplate && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
                      Template
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Operations:
                    </span>
                    <span className="text-sm ml-1">
                      {workflow.operations.length}
                    </span>
                    {getOperationsSummary(workflow.operations)}
                  </div>

                  {workflow.connectionId && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Connection:
                      </span>
                      <span className="text-sm ml-1">
                        {workflow.connectionName}
                      </span>
                    </div>
                  )}

                  {workflow.userId && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        User:
                      </span>
                      <span className="text-sm ml-1">{workflow.username}</span>
                    </div>
                  )}

                  {workflow.createdAt && (
                    <div className="text-xs text-muted-foreground">
                      Created:{" "}
                      {new Date(workflow.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditWorkflow(workflow)}
                >
                  <FileCog className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleRunWorkflow(workflow)}
                >
                  <Play className="h-4 w-4 mr-1" /> Run
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-none"
                  onClick={() => handleDeleteWorkflow(workflow.id!)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Workflow Dialog */}
      <WorkflowDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        workflow={currentWorkflow}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
