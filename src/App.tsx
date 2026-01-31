import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RawAlertsPage from "./pages/RawAlertsPage";
import AlertWorkbenchPage from "./pages/AlertWorkbenchPage";
import AlertDetailsPage from "./pages/AlertDetailsPage";
import CasesPage from "./pages/CasesPage";
import CaseWorkspacePage from "./pages/CaseWorkspacePage";
import STRDraftPage from "./pages/STRDraftPage";
import POReviewPage from "./pages/POReviewPage";
import STRConfirmationPage from "./pages/STRConfirmationPage";
import AuditTrailPage from "./pages/AuditTrailPage";
import MLOpsPage from "./pages/MLOpsPage";
import ModelTuningPage from "./pages/ModelTuningPage";
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
      <Route path="/alerts/raw" element={<ProtectedRoute><RawAlertsPage /></ProtectedRoute>} />
      <Route path="/alerts/workbench" element={<ProtectedRoute><AlertWorkbenchPage /></ProtectedRoute>} />
      <Route path="/alerts/:alertId" element={<ProtectedRoute><AlertDetailsPage /></ProtectedRoute>} />
      <Route path="/cases" element={<ProtectedRoute><CasesPage /></ProtectedRoute>} />
      <Route path="/cases/:caseId" element={<ProtectedRoute><CaseWorkspacePage /></ProtectedRoute>} />
      <Route path="/str" element={<ProtectedRoute><CasesPage /></ProtectedRoute>} />
      <Route path="/str/draft/:caseId" element={<ProtectedRoute><STRDraftPage /></ProtectedRoute>} />
      <Route path="/str/review" element={<ProtectedRoute><POReviewPage /></ProtectedRoute>} />
      <Route path="/str/confirmed" element={<ProtectedRoute><STRConfirmationPage /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute><AuditTrailPage /></ProtectedRoute>} />
      <Route path="/mlops" element={<ProtectedRoute><MLOpsPage /></ProtectedRoute>} />
      <Route path="/model-tuning" element={<ProtectedRoute><ModelTuningPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
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
);

export default App;
