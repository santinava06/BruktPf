import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CategoryProvider } from './context/CategoryContext';
import { useAuth } from './hooks/useAuth';
import AuthGuard from './components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';

// Lazy load components for better performance
const Groups = lazy(() => import('./pages/Groups'));
const GroupDetails = lazy(() => import('./pages/GroupDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SimpleLogin = lazy(() => import('./components/SimpleLogin'));
const TestLogin = lazy(() => import('./components/TestLogin'));
const ClearAuth = lazy(() => import('./components/ClearAuth'));

// Loading component
const LoadingSpinner = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: (theme) => theme.palette.background.default,
        transition: 'background-color 0.3s ease'
      }}
    >
      <Box
        sx={(theme) => ({
          width: 50,
          height: 50,
          border: `3px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e3e3e3'}`,
          borderTop: `3px solid ${theme.palette.primary.main}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        })}
      />
    </Box>
  );
};

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? <AuthGuard>{children}</AuthGuard> : <Navigate to="/login" />;
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password';

  return (
    <>
      <Navbar />
      <div style={{
        padding: isAuthPage ? 0 : 20,
        minHeight: isAuthPage ? '100vh' : 'auto'
      }}>
        <AppRoutes />
      </div>
    </>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/debug-login" element={<SimpleLogin />} />
        <Route path="/test-login" element={<TestLogin />} />
        <Route path="/clear-auth" element={<ClearAuth />} />
        <Route path="/force-logout" element={<ClearAuth />} />
        {/* Redirect root and dashboard to groups (main dashboard) */}
        <Route path="/" element={<PrivateRoute><Navigate to="/groups" replace /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Navigate to="/groups" replace /></PrivateRoute>} />
        {/* Main dashboard - Groups */}
        <Route path="/groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
        <Route path="/groups/:groupId" element={<PrivateRoute><GroupDetails /></PrivateRoute>} />
        {/* User profile routes */}
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <CategoryProvider>
            <Router>
              <AppContent />
            </Router>
          </CategoryProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
