import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DatabaseIcon,
  Users,
  FileCog,
  LineChart,
  Clock,
  ArrowRightCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  connectionService,
  type DatabaseConnection,
} from "@/services/connectionService";
import { userService } from "@/services/userService";
import { workflowService } from "@/services/workflowService";
import type {
  TestWorkflow,
  TestRun as WorkflowTestRun,
} from "@/models/workflowTypes";
import type { TestUser } from "@/models/userTypes";
import { useAuth } from "@/hooks/useAuth";

// Define error state interfaces
interface ErrorState {
  connections: boolean;
  users: boolean;
  workflows: boolean;
  testRuns: boolean;
}

export function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    connections: 0,
    users: 0,
    workflows: 0,
    testRuns: 0,
  }); // Use the imported type
  const [recentRuns, setRecentRuns] = useState<WorkflowTestRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorState>({
    connections: false,
    users: false,
    workflows: false,
    testRuns: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);

      // Function to fetch data from APIs
      const fetchData = async () => {
        try {
          const newErrors = {
            connections: false,
            users: false,
            workflows: false,
            testRuns: false,
          };
          let connectionsData: DatabaseConnection[] = [];
          let usersData: TestUser[] = [];
          let workflowsData: TestWorkflow[] = [];
          let testRunsData: WorkflowTestRun[] = [];

          // Get connections from API
          try {
            const connectionsResponse =
              await connectionService.getAllConnections();
            if (
              connectionsResponse.success &&
              connectionsResponse.connections
            ) {
              connectionsData = connectionsResponse.connections;
            } else {
              console.error(
                "Connection response unsuccessful:",
                connectionsResponse.message
              );
              newErrors.connections = true;
            }
          } catch (error) {
            console.error("Error fetching connections:", error);
            newErrors.connections = true;
          }

          // Get users from API
          try {
            const usersResponse = await userService.getAllUsers();
            if (usersResponse.success && usersResponse.users) {
              usersData = usersResponse.users;
            } else {
              console.error(
                "Users response unsuccessful:",
                usersResponse.message
              );
              newErrors.users = true;
            }
          } catch (error) {
            console.error("Error fetching users:", error);
            newErrors.users = true;
          }

          // Get workflows from API
          try {
            const workflowsResponse = await workflowService.getAllWorkflows();
            if (workflowsResponse.success && workflowsResponse.workflows) {
              workflowsData = workflowsResponse.workflows;
            } else {
              console.error(
                "Workflows response unsuccessful:",
                workflowsResponse.message
              );
              newErrors.workflows = true;
            }
          } catch (error) {
            console.error("Error fetching workflows:", error);
            newErrors.workflows = true;
          }

          // Get test runs from API
          try {
            const testRunsResponse = await workflowService.getTestRuns();
            if (testRunsResponse.success && testRunsResponse.testRuns) {
              testRunsData = testRunsResponse.testRuns;
            } else {
              console.error(
                "Test runs response unsuccessful:",
                testRunsResponse.message
              );
              newErrors.testRuns = true;
            }
          } catch (error) {
            console.error("Error fetching test runs:", error);
            newErrors.testRuns = true;
          }

          // Update error state
          setErrors(newErrors);

          // Update stats with available data
          setStats({
            connections: connectionsData.length,
            users: usersData.length,
            workflows: workflowsData.length,
            testRuns: testRunsData.length,
          });

          // Update recent runs if data is available
          if (testRunsData.length > 0) {
            setRecentRuns(
              testRunsData
                .sort(
                  (a, b) =>
                    new Date(b.startTime).getTime() -
                    new Date(a.startTime).getTime()
                )
                .slice(0, 3)
            );
          } else {
            setRecentRuns([]);
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          setErrors({
            connections: true,
            users: true,
            workflows: true,
            testRuns: true,
          });

          // Set empty data when errors occur
          setStats({
            connections: 0,
            users: 0,
            workflows: 0,
            testRuns: 0,
          });

          setRecentRuns([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [isAuthenticated]);

  const getStatusIcon = (isSuccessful: boolean | undefined) => {
    if (isSuccessful === undefined)
      return <Clock className="h-5 w-5 text-gray-500" />;
    return isSuccessful ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  // Dashboard view for authenticated users
  if (isAuthenticated) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {user?.firstName || user?.username}!
          </h1>
          <p className="text-muted-foreground">
            Your database testing dashboard - validate connections, permissions,
            and workflows.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Database Connections
                  </CardTitle>
                  <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.connections}</div>
                  <p className="text-xs text-muted-foreground">
                    Configure and test different databases
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Test Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users}</div>
                  <p className="text-xs text-muted-foreground">
                    Database users with different permissions
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Workflows
                  </CardTitle>
                  <FileCog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.workflows}</div>
                  <p className="text-xs text-muted-foreground">
                    Test sequences for validations
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tests Run
                  </CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.testRuns}</div>
                  <p className="text-xs text-muted-foreground">
                    Total workflow executions
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 mb-8">
              {/* Recent test runs */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Recent Tests</CardTitle>
                  <CardDescription>
                    Your most recent workflow executions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentRuns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="mb-2 text-muted-foreground">
                        No test runs found
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/workflows">Run a workflow</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentRuns.map((run) => (
                        <div
                          key={run.id}
                          className="flex items-center space-x-4"
                        >
                          <div>{getStatusIcon(run.isSuccessful)}</div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium leading-none">
                              {run.workflowName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {run.connectionName} / {run.username}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(run.startTime).toLocaleString()}
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/results/${run.id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                      <div className="pt-2 text-center">
                        <Button variant="link" size="sm" asChild>
                          <Link to="/results">View all tests</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-between" asChild>
                    <Link to="/connections/new">
                      <DatabaseIcon className="mr-2 h-4 w-4" />
                      New Connection
                      <ArrowRightCircle className="ml-auto h-4 w-4" />
                    </Link>
                  </Button>
                  <Button className="w-full justify-between" asChild>
                    <Link to="/users/new">
                      <Users className="mr-2 h-4 w-4" />
                      New Test User
                      <ArrowRightCircle className="ml-auto h-4 w-4" />
                    </Link>
                  </Button>
                  <Button className="w-full justify-between" asChild>
                    <Link to="/workflows/new">
                      <FileCog className="mr-2 h-4 w-4" />
                      New Workflow
                      <ArrowRightCircle className="ml-auto h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    className="w-full justify-between"
                    variant="outline"
                    asChild
                  >
                    <Link to="/results">
                      <LineChart className="mr-2 h-4 w-4" />
                      View All Results
                      <ArrowRightCircle className="ml-auto h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    );
  }

  // Public landing page for unauthenticated users
  return (
    <div className="container py-10">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Welcome to DbTester</h1>
        <p className="text-xl text-muted-foreground max-w-[700px] mb-6">
          Test database permissions and user access with structured workflows
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/register">Create Account</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Database Connections</CardTitle>
            <CardDescription>
              Configure and manage connections to your databases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Set up connections to PostgreSQL databases that you want to test.
              Add connection details and verify them before testing.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Get Started</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Users</CardTitle>
            <CardDescription>
              Define users with different permission levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Create test users with specific permissions to verify access
              controls and security in your database.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Get Started</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Workflows</CardTitle>
            <CardDescription>Create and run test sequences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Build structured test workflows to verify permissions and
              operations across different database objects.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-xl font-medium mb-2">Connect</h3>
            <p className="text-muted-foreground">
              Set up connections to your PostgreSQL databases
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-xl font-medium mb-2">Configure</h3>
            <p className="text-muted-foreground">
              Define test users and create test workflows
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-xl font-medium mb-2">Test</h3>
            <p className="text-muted-foreground">
              Run workflows and analyze results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
