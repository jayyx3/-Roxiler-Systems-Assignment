import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

import Login from '../pages/auth/Login.jsx';
import Signup from '../pages/auth/Signup.jsx';
import Unauthorized from '../pages/shared/Unauthorized.jsx';
import UpdatePassword from '../pages/shared/UpdatePassword.jsx';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import AdminUsersList from '../pages/admin/UsersList.jsx';
import AdminStoresList from '../pages/admin/StoresList.jsx';

// Normal User Pages
import UserStoresList from '../pages/user/StoresList.jsx';

// Store Owner Pages
import OwnerDashboard from '../pages/storeOwner/Dashboard.jsx';

// Route Guards
import ProtectedRoute from '../components/ProtectedRoute.jsx';

// Helper component to redirect root "/" to the appropriate dashboard
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'SYSTEM_ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'NORMAL_USER':
      return <Navigate to="/user/stores" replace />;
    case 'STORE_OWNER':
      return <Navigate to="/owner/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Shared Authenticated Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']} />}>
        <Route path="/update-password" element={<UpdatePassword />} />
      </Route>

      {/* System Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsersList />} />
        <Route path="/admin/stores" element={<AdminStoresList />} />
      </Route>

      {/* Normal User Routes */}
      <Route element={<ProtectedRoute allowedRoles={['NORMAL_USER']} />}>
        <Route path="/user/stores" element={<UserStoresList />} />
      </Route>

      {/* Store Owner Routes */}
      <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER']} />}>
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      </Route>

      {/* Home Route Redirector */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
