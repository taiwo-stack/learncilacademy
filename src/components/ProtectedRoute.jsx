import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute Wrapper
 * Restricts access to authenticated users matching specific roles.
 */
export default function ProtectedRoute({ children, allowedRoles, user, allowRoomParticipant }) {
  const location = useLocation();

  // If allowRoomParticipant is enabled and we have a room parameter in the URL, bypass auth checks
  if (allowRoomParticipant) {
    const params = new URLSearchParams(location.search);
    if (params.has('room')) {
      return children;
    }
  }

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

