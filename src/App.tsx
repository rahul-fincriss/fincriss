import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

import AlertWorkbenchPage from "./pages/AlertWorkbenchPage";
import AlertDetailsPage from "./pages/AlertDetailsPage";
import CasesPage from "./pages/CasesPage";
import CaseWorkspacePage from "./pages/CaseWorkspacePage";
import AuditTrailPage from "./pages/AuditTrailPage";
import MLOpsPage from "./pages/MLOpsPage";
import ModelTuningPage from "./pages/ModelTuningPage";
import WorkforceManagementPage from "./pages/WorkforceManagementPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      
      <Route path="/alerts/workbench" element={<ProtectedRoute><AlertWorkbenchPage /></ProtectedRoute>} />
      <Route path="/alerts/:alertId" element={<ProtectedRoute><AlertDetailsPage /></ProtectedRoute>} />
      <Route path="/cases" element={<ProtectedRoute><CasesPage /></ProtectedRoute>} />
      <Route path="/cases/:caseId" element={<ProtectedRoute><CaseWorkspacePage /></ProtectedRoute>} />
      {/* Redirect legacy STR routes to Cases */}
      <Route path="/str" element={<Navigate to="/cases" replace />} />
      <Route path="/str/*" element={<Navigate to="/cases" replace />} />
      <Route path="/audit" element={<ProtectedRoute><AuditTrailPage /></ProtectedRoute>} />
      <Route path="/mlops" element={<ProtectedRoute><MLOpsPage /></ProtectedRoute>} />
      <Route path="/model-tuning" element={<ProtectedRoute><ModelTuningPage /></ProtectedRoute>} />
      <Route path="/workforce" element={<ProtectedRoute><WorkforceManagementPage /></ProtectedRoute>} />
      <Route path="/users" element={<Navigate to="/workforce" replace />} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
