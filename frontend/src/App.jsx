import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AIAssistantWidget from './components/AIAssistantWidget';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PersonalReportPage from './pages/PersonalReportPage';
import ReportHistoryPage from './pages/ReportHistoryPage';
import ReportDetailPage from './pages/ReportDetailPage';
import TeamDashboardPage from './pages/TeamDashboardPage';
import VisualInsightsPage from './pages/VisualInsightsPage';
import SectionComparatorPage from './pages/SectionComparatorPage';
import ReviewsListPage from './pages/ReviewsListPage';
import ManagerReviewPage from './pages/ManagerReviewPage';
import TeamMemberProfilePage from './pages/TeamMemberProfilePage';
import ProjectManagementPage from './pages/ProjectManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import AIAssistantPage from './pages/AIAssistantPage';

// Route guard for authenticated users
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs font-medium">
        Authenticating TeamSync session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
      {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && <AIAssistantWidget />}
    </div>
  );
};

// Smart default route based on role
const RoleBasedHome = () => {
  const { user } = useAuth();
  if (user?.role === 'MANAGER' || user?.role === 'ADMIN') {
    return <TeamDashboardPage />;
  }
  return <PersonalReportPage />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Pages */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleBasedHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report/current"
            element={
              <ProtectedRoute>
                <PersonalReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report/edit/:id"
            element={
              <ProtectedRoute>
                <PersonalReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report/:id"
            element={
              <ProtectedRoute>
                <ReportDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <ReportHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Manager & Admin Pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <TeamDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/insights"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <VisualInsightsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/comparator"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <SectionComparatorPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviews"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <ReviewsListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/review/:id"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <ManagerReviewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/member/:id"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <TeamMemberProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <ProjectManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Only Pages */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          {/* AI Intelligence Page - Manager & Admin only */}
          <Route
            path="/assistant"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <AIAssistantPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
