import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { workflowService } from "@/services/workflowService";
import { type TestRun } from "@/services/workflowTypes";
import { useToaster } from "@/hooks/useToaster";

export function ResultsPage() {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToaster();

  // Fetch test runs when component mounts
  useEffect(() => {
    fetchTestRuns();
  }, []);

  const fetchTestRuns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workflowService.getTestRuns();
      if (response.success) {
        setTestRuns(response.testRuns);
        if (response.testRuns.length > 0) {
          setSelectedRun(response.testRuns[0]);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load test results. Please try again later.");
      console.error("Error fetching test runs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const response = await workflowService.getTestRun(id);
      if (response.success && response.testRun) {
        setSelectedRun(response.testRun);
      } else {
        showToast({
          title: "Error",
          description: response.message || "Failed to load test run details",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to load test run details. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Error loading test run details:", err);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate duration
  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return "Still running";

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;

    if (durationMs < 1000) {
      return `${durationMs}ms`;
    } else {
      const seconds = Math.floor(durationMs / 1000);
      const ms = durationMs % 1000;
      return `${seconds}.${ms}s`;
    }
  };

  // Result status icon
  const getStatusIcon = (isSuccessful: boolean | undefined) => {
    if (isSuccessful === undefined) return <Clock className="h-4 w-4" />;
    return isSuccessful ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Test Results</h1>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <p className="text-muted-foreground">Loading test results...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchTestRuns}
          >
            Retry
          </Button>
        </div>
      ) : testRuns.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No test results found.</p>
          <p className="text-sm text-muted-foreground">
            Run a test workflow to see results here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Recent Test Runs</h2>
            <div className="space-y-4">
              {testRuns.map((run) => (
                <div
                  key={run.id}
                  className={`border rounded-md p-4 cursor-pointer transition-colors ${
                    selectedRun?.id === run.id
                      ? "border-primary bg-muted"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleViewDetails(run.id!)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{run.workflowName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {run.connectionName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        User: {run.username}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(run.startTime)}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs flex items-center ${
                        run.isSuccessful
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {run.isSuccessful ? (
                        <>
                          <Check className="h-3 w-3 mr-1" /> Passed
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-1" /> Failed
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedRun ? (
              <div>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedRun.workflowName}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              selectedRun.isSuccessful
                                ? "default"
                                : "destructive"
                            }
                          >
                            {selectedRun.isSuccessful ? "Passed" : "Failed"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Duration:{" "}
                            {calculateDuration(
                              selectedRun.startTime,
                              selectedRun.endTime
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="text-sm font-medium">Connection</h3>
                        <p className="text-sm">{selectedRun.connectionName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">User</h3>
                        <p className="text-sm">{selectedRun.username}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Started</h3>
                        <p className="text-sm">
                          {formatDate(selectedRun.startTime)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Completed</h3>
                        <p className="text-sm">
                          {selectedRun.endTime
                            ? formatDate(selectedRun.endTime)
                            : "Still running"}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium mb-4">
                      Operation Results
                    </h3>
                    <div className="space-y-4">
                      {selectedRun.operationResults.map((result, index) => (
                        <div
                          key={result.operationId}
                          className="border rounded-md p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(result.isSuccessful)}
                              <h4 className="font-medium">
                                {index + 1}. {result.operationName}
                              </h4>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {result.executionTime}ms
                            </span>
                          </div>

                          {result.resultMessage && (
                            <p className="text-sm mt-2 text-green-600">
                              {result.resultMessage}
                            </p>
                          )}

                          {result.errorMessage && (
                            <p className="text-sm mt-2 text-red-600">
                              {result.errorMessage}
                            </p>
                          )}

                          {result.actualResult && (
                            <div className="mt-2 bg-gray-50 p-2 rounded text-sm font-mono">
                              {result.actualResult}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p>Select a test run to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
