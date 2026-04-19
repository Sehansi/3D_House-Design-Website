import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component to restrict access based on authentication and roles
 * @param {Array} allowedRoles - List of roles that can access this route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect based on role
    if (user?.role === 'Admin') return <Navigate to="/admin" />;
    if (user?.role === 'Constructor') return <Navigate to="/constructor" />;
    if (user?.role === 'Architect') return <Navigate to="/architect" />;
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
