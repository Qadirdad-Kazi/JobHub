import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../../shared/schema';
import { config } from '../config';
import { api } from '../lib/api';

interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    firstName: string;
    lastName: string;
    name?: string;
    role: UserRole;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check authentication status on mount and when token changes
  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem(config.auth.tokenKey);
        const storedUser = localStorage.getItem(config.auth.userKey);
        
        if (!token || !storedUser) {
          // No token or user data found
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Set user from stored data immediately to prevent flashing login screen
        setUser(JSON.parse(storedUser));
        
        // Verify token with the server in the background
        try {
          const response = await api.get('/api/auth/me');

          if (response.status === 200) {
            // Token is valid, update user data from server response
            const userData = response.data;
            // Update the stored user data with fresh data from server
            localStorage.setItem(config.auth.userKey, JSON.stringify(userData));
            setUser(userData);
          }
          // For other error codes, keep the user logged in with stored data
        } catch (error: any) {
          if (error.response && error.response.status === 401) {
            // Only logout on explicit 401 Unauthorized
            console.log('Invalid token (401), logging out');
            localStorage.removeItem(config.auth.tokenKey);
            localStorage.removeItem(config.auth.userKey);
            setUser(null);
          } else {
            // Network error - keep the user logged in with stored data
            console.error('Error during token verification:', error);
            // User is already set from stored data, so we don't need to do anything
          }
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        // Keep the user logged in if there's a network error
        // but we have stored user data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      const userData: User = data.user;
      
      // Store user data and token in localStorage using config keys
      localStorage.setItem(config.auth.userKey, JSON.stringify(userData));
      localStorage.setItem(config.auth.tokenKey, data.token);
      
      setUser(userData);
      
      // Navigate based on user role
      if (userData.role === UserRole.JOBSEEKER) {
        navigate('/jobseeker/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    name?: string; // Add name as an optional field
  }) => {
    try {
      // Create a new object with exactly the fields the server expects
      const dataToSend = {
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword, // Explicitly include confirmPassword
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        name: userData.name || `${userData.firstName} ${userData.lastName}`
      };
      
      // Validate that the name meets the minimum length requirement (2 characters)
      if (!dataToSend.name || dataToSend.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      
      // Log the exact data being sent to the server (only in development)
      if (config.app.isDevelopment) {
        console.log('Sending registration data:', { ...dataToSend, password: '***', confirmPassword: '***' });
      }
      
      // Use the API client for the request
      const response = await api.post('/auth/register', dataToSend);
      
      const data = response.data;
      const newUser: User = data.user;
      
      // Store user data and token using config keys
      localStorage.setItem(config.auth.userKey, JSON.stringify(newUser));
      localStorage.setItem(config.auth.tokenKey, data.token);
      
      setUser(newUser);
      
      // Navigate based on user role
      if (newUser.role === UserRole.JOBSEEKER) {
        navigate('/jobseeker/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract error message from the response if available
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Registration failed';
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem(config.auth.userKey);
    localStorage.removeItem(config.auth.tokenKey);
    setUser(null);
    navigate('/login');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  // Add a loading state to prevent flashing login screen during auth check
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      {/* You can add a loading spinner here if desired */}
    </div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};