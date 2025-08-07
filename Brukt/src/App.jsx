import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import AuthGuard from './components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import theme from './theme';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Groups = lazy(() => import('./pages/Groups'));
const GroupExpenses = lazy(() => import('./pages/GroupExpenses'));
const GroupDetails = lazy(() => import('./pages/GroupDetails'));
const Reportes = lazy(() => import('./pages/Reportes'));
const Profile = lazy(() => import('./pages/Profile'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SimpleLogin = lazy(() => import('./components/SimpleLogin'));
const TestLogin = lazy(() => import('./components/TestLogin'));
const ClearAuth = lazy(() => import('./components/ClearAuth'));

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  }}>
    <div style={{
      width: 50,
      height: 50,
      border: '3px solid #e3e3e3',
      borderTop: '3px solid #133A1A',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

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
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
        <Route path="/groups/:groupId/expenses" element={<PrivateRoute><GroupExpenses /></PrivateRoute>} />
        <Route path="/groups/:groupId" element={<PrivateRoute><GroupDetails /></PrivateRoute>} />
        <Route path="/reportes" element={<PrivateRoute><Reportes /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
