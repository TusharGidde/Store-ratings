import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/Auth/AuthForm';
import LoadingSpinner from './components/Common/LoadingSpinner';
import LandingPage from './pages/LandingPage';
import Dashboard from './components/Layout/Dashboard';
import CustomerDashboard from './pages/Dashboard/CustomerDashboard';
import StoreOwnerDashboard from './pages/Dashboard/StoreOwnerDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import BrowseStores from './pages/Stores/BrowseStores';
import MyRatings from './pages/Customer/MyRatings';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageStores from './pages/Admin/ManageStores';
import ManageRatings from './pages/Admin/ManageRatings';
import MyStore from './pages/StoreOwner/MyStore';
import Analytics from './pages/StoreOwner/Analytics';
import Reviews from './pages/StoreOwner/Reviews';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect based on user role
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'store_owner':
        return <Navigate to="/store/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AuthForm type="login" />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <AuthForm type="signup" />
                </PublicRoute>
              }
            />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['normal_user']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<CustomerDashboard />} />
            </Route>

            <Route
              path="/stores"
              element={
                <ProtectedRoute allowedRoles={['normal_user']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<BrowseStores />} />
            </Route>

            <Route
              path="/my-ratings"
              element={
                <ProtectedRoute allowedRoles={['normal_user']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<MyRatings />} />
            </Route>

            {/* Store Owner Routes */}
            <Route
              path="/store/dashboard"
              element={
                <ProtectedRoute allowedRoles={['store_owner']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<StoreOwnerDashboard />} />
            </Route>

            <Route
              path="/my-store"
              element={
                <ProtectedRoute allowedRoles={['store_owner']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<MyStore />} />
            </Route>

            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['store_owner']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<Analytics />} />
            </Route>

            <Route
              path="/reviews"
              element={
                <ProtectedRoute allowedRoles={['store_owner']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<Reviews />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
            </Route>

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<ManageUsers />} />
            </Route>

            <Route
              path="/admin/stores"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<ManageStores />} />
            </Route>

            <Route
              path="/admin/ratings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<ManageRatings />} />
            </Route>

            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<div className="p-6"><h1 className="text-2xl font-bold">Admin Analytics - Coming Soon</h1></div>} />
            </Route>

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600">Page not found</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;