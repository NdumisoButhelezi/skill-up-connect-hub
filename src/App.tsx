
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoleSelection from "./pages/RoleSelection";
import Dashboard from "./pages/Dashboard";
import CreateWorkshop from "./pages/CreateWorkshop";
import WorkshopDetail from "./pages/WorkshopDetail";
import LessonDetail from "./pages/LessonDetail";
import Progress from "./pages/Progress";
import Leaderboard from "./pages/Leaderboard";
import LearnerProfiles from "./pages/LearnerProfiles";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Layouts
import DashboardLayout from "./components/layouts/DashboardLayout";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Route that redirects to dashboard if already logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Route that ensures user has selected a role
const RoleRequiredRoute = ({ children }: { children: React.ReactNode }) => {
  const { userRole, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!userRole) {
    return <Navigate to="/role-selection" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/role-selection" element={
              <ProtectedRoute>
                <RoleSelection />
              </ProtectedRoute>
            } />
            
            {/* Protected routes with dashboard layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <RoleRequiredRoute>
                  <DashboardLayout />
                </RoleRequiredRoute>
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="progress" element={<Progress />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="learners" element={<LearnerProfiles />} />
              <Route path="create-workshop" element={<CreateWorkshop />} />
              <Route path="workshop/:id" element={<WorkshopDetail />} />
              <Route path="lesson/:id" element={<LessonDetail />} />
            </Route>
            
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
