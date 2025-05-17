
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layouts/DashboardLayout';
import Index from './pages/Index';
import Signup from './pages/Signup';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Progress from './pages/Progress';
import NotFound from './pages/NotFound';
import LearnerProfiles from './pages/LearnerProfiles';
import CreateWorkshop from './pages/CreateWorkshop';
import WorkshopDetail from './pages/WorkshopDetail';
import LessonDetail from './pages/LessonDetail';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import FaqChatbot from './components/FaqChatbot';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="progress" element={<Progress />} />
            <Route path="learners" element={<LearnerProfiles />} />
            <Route path="create-workshop" element={<CreateWorkshop />} />
            <Route path="workshop/:id" element={<WorkshopDetail />} />
            <Route path="edit-workshop/:id" element={<WorkshopDetail />} />
            <Route path="lesson/:id" element={<LessonDetail />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <FaqChatbot />
      </AuthProvider>
    </Router>
  );
}

export default App;
