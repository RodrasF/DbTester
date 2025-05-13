import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { HomePage } from "./pages/HomePage";
import { ConnectionsPage } from "./pages/connections/ConnectionsPage";
import { ToasterProvider } from "./components/ui/toaster";
import { Toaster } from "./components/ui/toaster-component";
import { UsersPage } from "./pages/users/UsersPage";
import { WorkflowsPage } from "./pages/workflows/WorkflowsPage";
import { ResultsPage } from "./pages/results/ResultsPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { UnauthorizedPage } from "./pages/auth/UnauthorizedPage";
import { AuthProvider } from "./components/auth/AuthProvider";

function App() {
  return (
    <ToasterProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<RootLayout />}>
                <Route index element={<HomePage />} />
                <Route path="connections" element={<ConnectionsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="workflows" element={<WorkflowsPage />} />
                <Route path="results" element={<ResultsPage />} />
              </Route>
            </Route>

            {/* Admin-only routes */}
            <Route element={<ProtectedRoute requiredRole="Admin" />}>
              <Route path="admin/*" element={<RootLayout />}>
                {/* Add admin routes here */}
              </Route>
            </Route>

            {/* Fallback routes */}
            <Route path="unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </ToasterProvider>
  );
}

export default App;
