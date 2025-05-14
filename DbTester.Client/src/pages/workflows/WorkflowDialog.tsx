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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type TestWorkflow,
  type TestOperation,
  type TestOperationType,
  TestOperationTypes,
} from "@/models/workflowTypes";
import { PlusCircle, X, GripVertical, MoveUp, MoveDown } from "lucide-react";
import { connectionService } from "@/services/connectionService";
import { userService } from "@/services/userService";

interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow?: Partial<TestWorkflow>;
  onSubmit: (data: TestWorkflow) => void;
  isSubmitting?: boolean;
}

export function WorkflowDialog({
  open,
  onOpenChange,
  workflow,
  onSubmit,
  isSubmitting = false,
}: WorkflowDialogProps) {
  const [formData, setFormData] = useState<Partial<TestWorkflow>>(
    workflow || { operations: [], parameters: [], isTemplate: false }
  );
  const [connections, setConnections] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [users, setUsers] = useState<Array<{ id: string; username: string }>>(
    []
  );
  const [loadingData, setLoadingData] = useState(false);
  const [activeOperationIndex, setActiveOperationIndex] = useState<
    number | null
  >(null);

  const isEditing = Boolean(workflow?.id);

  // Load connections and users when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Reset form when workflow changes or dialog opens/closes
  useEffect(() => {
    if (workflow) {
      setFormData({ ...workflow });
    } else {
      setFormData({ operations: [], parameters: [], isTemplate: false });
    }
  }, [workflow, open]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      // Load connections
      const connectionsResponse = await connectionService.getAllConnections();
      if (connectionsResponse.success) {
        setConnections(
          connectionsResponse.connections.map((conn) => ({
            id: conn.id!,
            name: conn.name,
          }))
        );
      }

      // Load users
      const usersResponse = await userService.getAllUsers();
      if (usersResponse.success) {
        setUsers(
          usersResponse.users.map((user) => ({
            id: user.id!,
            username: user.username,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleConnectionChange = (value: string) => {
    const connection = connections.find((c) => c.id === value);
    setFormData({
      ...formData,
      connectionId: value,
      connectionName: connection?.name,
    });

    // Clear userId if it's not a template (since user is connection-specific)
    if (!formData.isTemplate) {
      setFormData((prev) => ({
        ...prev,
        userId: undefined,
        username: undefined,
      }));
    }
  };

  const handleUserChange = (value: string) => {
    const user = users.find((u) => u.id === value);
    setFormData({
      ...formData,
      userId: value,
      username: user?.username,
    });
  };

  // Operation management
  const addOperation = () => {
    const newOperation: TestOperation = {
      name: "",
      operationType: TestOperationTypes.SELECT,
      sqlStatement: "",
      expectedResult: "success",
      order: (formData.operations || []).length + 1,
    };

    setFormData((prev) => ({
      ...prev,
      operations: [...(prev.operations || []), newOperation],
    }));

    // Set focus to the new operation
    setActiveOperationIndex((formData.operations || []).length);
  };

  const updateOperation = (index: number, updates: Partial<TestOperation>) => {
    const updatedOperations = [...(formData.operations || [])];
    updatedOperations[index] = { ...updatedOperations[index], ...updates };

    setFormData((prev) => ({
      ...prev,
      operations: updatedOperations,
    }));
  };

  const removeOperation = (index: number) => {
    const updatedOperations = [...(formData.operations || [])];
    updatedOperations.splice(index, 1);

    // Reorder remaining operations
    updatedOperations.forEach((op, i) => {
      op.order = i + 1;
    });

    setFormData((prev) => ({
      ...prev,
      operations: updatedOperations,
    }));

    // Clear active operation if removed
    if (activeOperationIndex === index) {
      setActiveOperationIndex(null);
    }
  };

  const moveOperationUp = (index: number) => {
    if (index <= 0) return;

    const updatedOperations = [...(formData.operations || [])];
    const temp = updatedOperations[index];
    updatedOperations[index] = updatedOperations[index - 1];
    updatedOperations[index - 1] = temp;

    // Update order properties
    updatedOperations.forEach((op, i) => {
      op.order = i + 1;
    });

    setFormData((prev) => ({
      ...prev,
      operations: updatedOperations,
    }));

    // Update active index
    if (activeOperationIndex === index) {
      setActiveOperationIndex(index - 1);
    } else if (activeOperationIndex === index - 1) {
      setActiveOperationIndex(index);
    }
  };

  const moveOperationDown = (index: number) => {
    if (!formData.operations || index >= formData.operations.length - 1) return;

    const updatedOperations = [...(formData.operations || [])];
    const temp = updatedOperations[index];
    updatedOperations[index] = updatedOperations[index + 1];
    updatedOperations[index + 1] = temp;

    // Update order properties
    updatedOperations.forEach((op, i) => {
      op.order = i + 1;
    });

    setFormData((prev) => ({
      ...prev,
      operations: updatedOperations,
    }));

    // Update active index
    if (activeOperationIndex === index) {
      setActiveOperationIndex(index + 1);
    } else if (activeOperationIndex === index + 1) {
      setActiveOperationIndex(index);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name) {
      alert("Please enter a workflow name");
      return;
    }

    if (!formData.isTemplate) {
      if (!formData.connectionId) {
        alert("Please select a database connection");
        return;
      }
      if (!formData.userId) {
        alert("Please select a test user");
        return;
      }
    }

    if (!formData.operations || formData.operations.length === 0) {
      alert("Please add at least one operation to the workflow");
      return;
    }

    // Validate each operation
    const invalidOperations = formData.operations.filter(
      (op) => !op.name || !op.sqlStatement
    );
    if (invalidOperations.length > 0) {
      alert(
        `Please complete all operation details (name and SQL statement are required)`
      );
      return;
    }

    // Submit form
    onSubmit(formData as TestWorkflow);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Workflow" : "Create Workflow"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update your test workflow details below."
                : "Create a new test workflow to validate database permissions."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Basic info */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Workflow name"
                required
              />
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
                placeholder="Workflow description"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label>Workflow Type</Label>
              </div>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox
                  id="isTemplate"
                  checked={formData.isTemplate || false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("isTemplate", checked as boolean)
                  }
                />
                <label
                  htmlFor="isTemplate"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Template workflow (can be reused with different
                  connections/users)
                </label>
              </div>
            </div>

            {/* Connection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="connectionId" className="text-right">
                {formData.isTemplate ? "Default Connection" : "Connection*"}
              </Label>
              <Select
                value={formData.connectionId}
                onValueChange={handleConnectionChange}
                disabled={loadingData}
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

            {/* User */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userId" className="text-right">
                {formData.isTemplate ? "Default User" : "Test User*"}
              </Label>
              <Select
                value={formData.userId}
                onValueChange={handleUserChange}
                disabled={loadingData || !formData.connectionId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue
                    placeholder={
                      formData.connectionId
                        ? "Select a user"
                        : "Select a connection first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(
                      (user) =>
                        !formData.connectionId || user.id === formData.userId
                    )
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operations List */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Test Operations</h3>
                <Button type="button" size="sm" onClick={addOperation}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Operation
                </Button>
              </div>

              {formData.operations && formData.operations.length > 0 ? (
                <div className="space-y-4">
                  {formData.operations.map((operation, index) => (
                    <div
                      key={index}
                      className={`border rounded-md p-3 ${
                        activeOperationIndex === index ? "border-primary" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {operation.order}.{" "}
                            {operation.name || "(Unnamed Operation)"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => moveOperationUp(index)}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => moveOperationDown(index)}
                            disabled={
                              !formData.operations ||
                              index === formData.operations.length - 1
                            }
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => removeOperation(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {activeOperationIndex === index ? (
                        <div className="space-y-3 mt-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label
                                htmlFor={`operation-${index}-name`}
                                className="text-xs mb-1 block"
                              >
                                Name*
                              </Label>
                              <Input
                                id={`operation-${index}-name`}
                                value={operation.name}
                                onChange={(e) =>
                                  updateOperation(index, {
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Operation Name"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`operation-${index}-type`}
                                className="text-xs mb-1 block"
                              >
                                Type*
                              </Label>
                              <Select
                                value={operation.operationType}
                                onValueChange={(value) =>
                                  updateOperation(index, {
                                    operationType: value as TestOperationType,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(TestOperationTypes).map(
                                    (type) => (
                                      <SelectItem key={type} value={type}>
                                        {type.replace(/_/g, " ")}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label
                                htmlFor={`operation-${index}-target`}
                                className="text-xs mb-1 block"
                              >
                                Target Object
                              </Label>
                              <Input
                                id={`operation-${index}-target`}
                                value={operation.targetObject || ""}
                                onChange={(e) =>
                                  updateOperation(index, {
                                    targetObject: e.target.value,
                                  })
                                }
                                placeholder="Table/View name"
                              />
                            </div>
                          </div>

                          <div>
                            <Label
                              htmlFor={`operation-${index}-sql`}
                              className="text-xs mb-1 block"
                            >
                              SQL Statement*
                            </Label>
                            <Textarea
                              id={`operation-${index}-sql`}
                              value={operation.sqlStatement}
                              onChange={(e) =>
                                updateOperation(index, {
                                  sqlStatement: e.target.value,
                                })
                              }
                              placeholder="SQL statement to execute"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor={`operation-${index}-expected`}
                              className="text-xs mb-1 block"
                            >
                              Expected Result*
                            </Label>
                            <Select
                              value={operation.expectedResult}
                              onValueChange={(value) =>
                                updateOperation(index, {
                                  expectedResult: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Expected result" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="error">
                                  Error (Permission denied)
                                </SelectItem>
                                <SelectItem value="custom">
                                  Custom (specific rows/data)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setActiveOperationIndex(index)}
                        >
                          Edit Details
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border rounded-md">
                  <p className="text-muted-foreground mb-2">
                    No operations added yet
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOperation}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Your First
                    Operation
                  </Button>
                </div>
              )}
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
                ? "Update Workflow"
                : "Create Workflow"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
