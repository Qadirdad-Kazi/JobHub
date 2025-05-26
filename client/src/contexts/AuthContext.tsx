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
    name: string;
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
        const response = await api.get('/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);

    toast({
      title: 'Login successful',
      description: 'Welcome back! You\'ve been logged in successfully.',
    });

    // Redirect based on user role
    if (user.role === UserRole.JOBSEEKER) {
      navigate('/jobseeker/dashboard');
    } else if (user.role === UserRole.EMPLOYER) {
      navigate('/employer/dashboard');
    }
  };

  const register = async (data: {
    email: string;
    name: string;
    username: string;
    password: string;
    role: UserRole;
  }) => {
    const response = await api.post('/auth/register', data);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);

    toast({
      title: 'Registration successful',
      description: 'Welcome to CareerConnectPro! Your account has been created successfully.',
    });

    // Redirect based on user role
    if (user.role === UserRole.JOBSEEKER) {
      navigate('/jobseeker/dashboard');
    } else if (user.role === UserRole.EMPLOYER) {
      navigate('/employer/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
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