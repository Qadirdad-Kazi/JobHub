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
    username: string;
    firstName: string;
    lastName: string;
    name?: string;
    role: UserRole;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
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
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user data on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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
    username: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    name?: string; // Add name as an optional field
  }) => {
    try {
      // Ensure the name field is included for the server
      const dataToSend = {
        ...userData,
        // Make sure name is explicitly set using firstName and lastName
        name: userData.name || `${userData.firstName} ${userData.lastName}`
      };
      
      // Validate that the name meets the minimum length requirement (2 characters)
      if (!dataToSend.name || dataToSend.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      
      // Log the data being sent to the server
      console.log('Sending registration data:', dataToSend);
      
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};