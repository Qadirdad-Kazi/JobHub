import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../../shared/schema';

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
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
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
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            // Token is valid, update user data from server response
            const userData = await response.json();
            // Update the stored user data with fresh data from server
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
          } else if (response.status === 401) {
            // Only logout on explicit 401 Unauthorized
            console.log('Invalid token (401), logging out');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
          // For other error codes, keep the user logged in with stored data
        } catch (networkError) {
          // Network error - keep the user logged in with stored data
          console.error('Network error during token verification:', networkError);
          // User is already set from stored data, so we don't need to do anything
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      const data = await response.json();
      const userData: User = data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      setUser(userData);
      if (userData.role === UserRole.JOBSEEKER) {
        navigate('/jobseeker/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
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
      
      // Log the exact data being sent to the server
      console.log('Sending registration data:', dataToSend);
      console.log('JSON payload:', JSON.stringify(dataToSend));
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      // First check if the response is ok
      if (!response.ok) {
        // Get the response text first to avoid JSON parsing errors
        const responseText = await response.text();
        console.error('Server error response text:', responseText);
        
        try {
          // Try to parse the response as JSON if possible
          if (responseText) {
            const errorData = JSON.parse(responseText);
            console.error('Server error response parsed:', errorData);
            throw new Error(errorData.message || 'Registration failed');
          }
        } catch (parseError) {
          // If we can't parse the error as JSON, use the text or status
          console.error('Error parsing response as JSON:', parseError);
        }
        
        // If we couldn't parse JSON or there was no text, use status
        throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
      }
      
      // Parse successful response
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing success response:', parseError, 'Response text:', responseText);
        throw new Error('Invalid response from server');
      }
      
      const newUser: User = data.user;
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', data.token);
      setUser(newUser);
      if (newUser.role === UserRole.JOBSEEKER) {
        navigate('/jobseeker/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
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