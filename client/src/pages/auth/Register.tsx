import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  Link,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../../../shared/schema';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRole).default(UserRole.JOBSEEKER),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Check if the user is coming from the post-job page
  const queryParams = new URLSearchParams(window.location.search);
  const isEmployerRegistration = queryParams.get('role') === 'employer';
  
  // Set the initial role based on the URL parameter
  const initialRole = isEmployerRegistration ? UserRole.EMPLOYER : UserRole.JOBSEEKER;
  
  // Log the initial role for debugging
  console.log('Initial role set to:', initialRole, 'isEmployerRegistration:', isEmployerRegistration);

  const { register, handleSubmit, formState: { errors, isValid }, watch, setValue } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: initialRole
    },
    mode: 'onChange'
  });
  
  // Ensure role is set to a valid value on component mount
  useEffect(() => {
    // Force set the role value to ensure it's properly initialized
    setValue('role', initialRole, { shouldValidate: true });
  }, [initialRole, setValue]);

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      try {
        // Force the correct role based on the URL parameter
        const correctedRole = isEmployerRegistration ? UserRole.EMPLOYER : data.role;
        console.log('Registration with role:', correctedRole);
        
        // Use the AuthContext register function
        await registerAuth({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          role: correctedRole,
          name: `${data.firstName} ${data.lastName}`
        });
        
        return { success: true };
      } catch (error) {
        console.error('Registration error:', error);
        throw new Error(error instanceof Error ? error.message : 'Registration failed');
      }
    },
    onError: (error) => {
      setServerError(error.message);
    },
  });

  // Log form validation state whenever it changes
  useEffect(() => {
    console.log('Form validation state:', { isValid, errors });
  }, [isValid, errors]);

  const onSubmit = (data: RegisterFormData) => {
    console.log('Form submitted with data:', data);
    // No need to modify the data here as the mutation function will handle it
    setServerError(null);
    registerMutation.mutate(data);
  };

  // This function is not used in the application
  // Removing to fix the lint warning
  

  const selectedRole = watch('role');

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Create Your Account
          </Typography>
          
          {serverError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              {/* Role Selection */}
              <Box width="100%">
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">I want to:</FormLabel>
                  <RadioGroup
                    row
                    value={watch('role') || initialRole}
                    onChange={(e) => setValue('role', e.target.value as UserRole, { shouldValidate: true })}
                  >
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Box width="100%" sx={{ flex: 1 }}>
                        <Paper 
                          elevation={selectedRole === UserRole.JOBSEEKER ? 3 : 1}
                          sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            border: selectedRole === UserRole.JOBSEEKER ? 2 : 1,
                            borderColor: selectedRole === UserRole.JOBSEEKER ? 'primary.main' : 'grey.300',
                          }}
                          onClick={() => setValue('role', UserRole.JOBSEEKER, { shouldValidate: true })}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WorkIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                            <FormControlLabel
                              value={UserRole.JOBSEEKER}
                              control={<Radio />}
                              label={
                                <Box>
                                  <Typography variant="h6">Find a Job</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    I'm looking for my next opportunity
                                  </Typography>
                                </Box>
                              }
                            />
                          </Box>
                        </Paper>
                      </Box>
                      <Box width="100%" sx={{ flex: 1 }}>
                        <Paper 
                          elevation={selectedRole === UserRole.EMPLOYER ? 3 : 1}
                          sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            border: selectedRole === UserRole.EMPLOYER ? 2 : 1,
                            borderColor: selectedRole === UserRole.EMPLOYER ? 'primary.main' : 'grey.300',
                          }}
                          onClick={() => setValue('role', UserRole.EMPLOYER, { shouldValidate: true })}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                            <FormControlLabel
                              value={UserRole.EMPLOYER}
                              control={<Radio />}
                              label={
                                <Box>
                                  <Typography variant="h6">Post a Job</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    I'm looking to hire talent
                                  </Typography>
                                </Box>
                              }
                            />
                          </Box>
                        </Paper>
                      </Box>
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </Box>

              {/* Form Fields */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    {...register('firstName')}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    autoComplete="given-name"
                  />
                </Box>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    {...register('lastName')}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    autoComplete="family-name"
                  />
                </Box>
              </Stack>
              <Box width="100%">
                <TextField
                  fullWidth
                  label="Username"
                  {...register('username')}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  autoComplete="username"
                />
              </Box>
              <Box width="100%">
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete="email"
                />
              </Box>
              <Box width="100%">
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="new-password"
                />
              </Box>
              <Box width="100%">
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  autoComplete="new-password"
                />
              </Box>
              <Box width="100%">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
                
                {/* Login link */}
                <Box mt={2}>
                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    size="large"
                    onClick={() => navigate('/login')}
                  >
                    Already have an account? Sign In
                  </Button>
                </Box>
              </Box>
            </Stack>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/login')}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}; 