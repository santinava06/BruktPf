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
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load components for better performance
const Groups = lazy(() => import('./pages/Groups'));
const GroupExpenses = lazy(() => import('./pages/GroupExpenses'));
const GroupDetails = lazy(() => import('./pages/GroupDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

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

function HomeRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/groups" replace /> : children;
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
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
  const location = useLocation();
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/auth/callback" element={<PageTransition><AuthCallback /></PageTransition>} />
          <Route path="/" element={<HomeRoute><PageTransition><LandingPage /></PageTransition></HomeRoute>} />
          <Route path="/groups" element={<PrivateRoute><PageTransition><Groups /></PageTransition></PrivateRoute>} />
          <Route path="/groups/:groupId/expenses" element={<PrivateRoute><PageTransition><GroupExpenses /></PageTransition></PrivateRoute>} />
          <Route path="/groups/:groupId" element={<PrivateRoute><PageTransition><GroupDetails /></PageTransition></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><PageTransition><Profile /></PageTransition></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><PageTransition><Settings /></PageTransition></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><PageTransition><ChangePassword /></PageTransition></PrivateRoute>} />
        </Routes>
      </AnimatePresence>
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
