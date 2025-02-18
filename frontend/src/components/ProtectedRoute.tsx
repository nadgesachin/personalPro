import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoute - user:", user);

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to /login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Allow access to profile page for new users
  if (location.pathname === '/profile' && !user?.profileCompleted) {
    return <>{children}</>;
  }

  // For all other protected routes, require complete profile
  if (!user?.profileCompleted && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  // Temporarily bypass other conditions to test rendering
  console.log("Rendering children components");
  return <>{children}</>;
}; 