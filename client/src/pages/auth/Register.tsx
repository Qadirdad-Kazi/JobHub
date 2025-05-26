import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['jobseeker', 'employer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'jobseeker'
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      try {
        await registerAuth({
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role
        });
        return { success: true };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Registration failed');
      }
    },
    onError: (error) => {
      setServerError(error.message);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setServerError(null);
    registerMutation.mutate(data);
  };

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
            <Grid container spacing={3}>
              {/* Role Selection */}
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">I want to:</FormLabel>
                  <RadioGroup
                    row
                    {...register('role')}
                    defaultValue="jobseeker"
                  >
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <Paper 
                          elevation={selectedRole === 'jobseeker' ? 3 : 1}
                          sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            border: selectedRole === 'jobseeker' ? 2 : 1,
                            borderColor: selectedRole === 'jobseeker' ? 'primary.main' : 'grey.300',
                          }}
                          onClick={() => {
                            const roleField = register('role');
                            roleField.onChange({ target: { value: 'jobseeker' } });
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WorkIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                            <FormControlLabel
                              value="jobseeker"
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
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper 
                          elevation={selectedRole === 'employer' ? 3 : 1}
                          sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            border: selectedRole === 'employer' ? 2 : 1,
                            borderColor: selectedRole === 'employer' ? 'primary.main' : 'grey.300',
                          }}
                          onClick={() => {
                            const roleField = register('role');
                            roleField.onChange({ target: { value: 'employer' } });
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                            <FormControlLabel
                              value="employer"
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
                      </Grid>
                    </Grid>
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Form Fields */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  autoComplete="name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12}>
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
              </Grid>
            </Grid>
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