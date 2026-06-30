import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Wrapper
 * Restricts access to authenticated users matching specific roles.
 */
export default function ProtectedRoute({ children, allowedRoles, user }) {
  if (!user || user.role === 'guest') {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If role is not allowed, redirect to the home page
    return <Navigate to="/" replace />;
  }

  return children;
}
