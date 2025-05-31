import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/toast';
import { api } from '../lib/api';
import { User, UserRole } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/api/auth/me');
        setUser(response.data);
        localStorage.setItem('userData', JSON.stringify(response.data));
        
        // Redirect to appropriate dashboard if on login/register pages
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/register') {
          handleRoleBasedRedirect(response.data.role);
        }
      }
    } catch (error) {
      console.error('Error during token verification:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleBasedRedirect = (role: UserRole) => {
    try {
      switch (role) {
        case UserRole.JOBSEEKER:
          navigate('/jobseeker/dashboard');
          break;
        case UserRole.EMPLOYER:
          navigate('/employer/dashboard');
          break;
        default:
          throw new Error('Invalid user role');
      }
    } catch (error) {
      console.error('Error during role-based redirect:', error);
      toast({
        title: 'Navigation Error',
        description: 'There was an error redirecting you to your dashboard. Please try logging in again.',
      });
      logout();
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      if (!user.role) {
        throw new Error('Invalid user role received from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      toast({
        title: 'Login successful',
        description: 'Welcome back! You\'ve been logged in successfully.',
      });

      handleRoleBasedRedirect(user.role);
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'An error occurred during login. Please try again.',
      });
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    role: UserRole;
  }) => {
    try {
      const response = await api.post('/api/auth/register', data);
      const { token, user } = response.data;
      
      if (!user.role) {
        throw new Error('Invalid user role received from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      toast({
        title: 'Registration successful',
        description: 'Welcome to CareerConnectPro! Your account has been created successfully.',
      });

      handleRoleBasedRedirect(user.role);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration. Please try again.',
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/');
    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of your account.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 