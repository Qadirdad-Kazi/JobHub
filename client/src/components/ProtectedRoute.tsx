import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../../shared/schema';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login or registration with appropriate role
  if (!isAuthenticated) {
    // Special handling for employer-specific routes like post-job
    if (allowedRoles.length === 1 && allowedRoles[0] === UserRole.EMPLOYER && location.pathname === '/post-job') {
      // Redirect to registration with employer role pre-selected
      return <Navigate to="/register?role=employer" />;
    }
    
    // Default redirect to login
    return <Navigate to="/login" />;
  }

  // If authenticated but wrong role
  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    return <Navigate to={user.role === UserRole.JOBSEEKER ? '/jobseeker/dashboard' : '/employer/dashboard'} />;
  }

  return <>{children}</>;
}; 