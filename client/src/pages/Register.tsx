import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Link as MuiLink,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  SelectChangeEvent,
  Grid,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { UserRole } from '../../../shared/schema';
import { useAuth } from '../context/AuthContext';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole | '';
}

export const Register: React.FC = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.role) {
      setError('Please select an account type');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as UserRole,
        name: `${formData.firstName} ${formData.lastName}`,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create Your Account
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="firstName"
                  required
                  fullWidth
                  label="First Name"
                  autoFocus
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="lastName"
                  required
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  name="username"
                  required
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  name="email"
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  name="password"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  name="confirmPassword"
                  required
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth required>
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    label="Account Type"
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <MenuItem value={UserRole.JOBSEEKER}>Job Seeker</MenuItem>
                    <MenuItem value={UserRole.EMPLOYER}>Employer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  sx={{ mt: 2 }}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <MuiLink component={Link} to="/login" variant="body2">
                Already have an account? Sign in
              </MuiLink>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};