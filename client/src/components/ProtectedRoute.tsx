import React from 'react';
import { Navigate } from 'react-router-dom';
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

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard if authenticated but wrong role
    return <Navigate to={user.role === UserRole.JOBSEEKER ? '/jobseeker/dashboard' : '/employer/dashboard'} />;
  }

  return <>{children}</>;
}; 