import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface JobFormData {
  title: string;
  jobType: string;
  location: string;
  salary: string;
  description: string;
  requirements: string;
  company?: string;
}

export const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    jobType: 'full-time',
    location: '',
    salary: '',
    description: '',
    requirements: ''
  });
  const [error, setError] = useState<string | null>(null);
  
  // Handle text field changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select field changes
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const postJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      // Format requirements as an array
      const requirementsArray = data.requirements
        .split('\n')
        .map(req => req.trim())
        .filter(req => req !== '');
      
      if (requirementsArray.length === 0) {
        throw new Error('At least one requirement is needed');
      }
      
      // Parse salary into min and max if provided
      let salaryData = {
        min: 0,
        max: 0,
        currency: 'USD'
      };
      
      if (data.salary) {
        // Try to extract min and max values if salary is in format like "$80,000 - $100,000"
        const salaryMatch = data.salary.match(/\$?(\d[\d,]*)\s*-\s*\$?(\d[\d,]*)/i);
        if (salaryMatch) {
          const min = parseInt(salaryMatch[1].replace(/,/g, ''));
          const max = parseInt(salaryMatch[2].replace(/,/g, ''));
          salaryData = {
            min,
            max,
            currency: 'USD'
          };
        } else {
          // If it's a single number, use it for both min and max
          const numericValue = parseInt(data.salary.replace(/[^0-9]/g, ''));
          if (!isNaN(numericValue)) {
            salaryData = {
              min: numericValue,
              max: numericValue,
              currency: 'USD'
            };
          }
        }
      }
      
      // Ensure company name meets minimum length requirement
      const companyName = user?.firstName 
        ? `${user.firstName}'s Company` 
        : 'Company Name';
        
      if (companyName.length < 2) {
        throw new Error('Company name must be at least 2 characters');
      }
      
      // Format the job data to match the backend schema
      const jobData = {
        title: data.title,
        type: data.jobType,
        location: data.location,
        salary: salaryData,
        description: data.description,
        requirements: requirementsArray,
        company: companyName,
        postedBy: user?.id,
        status: 'active'
      };
      
      console.log('Posting job with data:', jobData);
      
      try {
        const response = await api.post('/api/jobs', jobData);
        return response.data;
      } catch (error: any) {
        console.error('Failed to post job:', error);
        
        // Handle axios error response
        if (error.response?.data) {
          const errorData = error.response.data;
          
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Format Zod validation errors
            const errorMessage = errorData.errors.map((err: any) => 
              `${err.path.join('.')}: ${err.message}`
            ).join(', ');
            throw new Error(errorMessage);
          } else if (errorData.message) {
            throw new Error(errorData.message);
          }
        }
        
        throw new Error(error.message || 'Failed to post job');
      }
    },
    onSuccess: () => {
      navigate('/employer/jobs');
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate according to server schema requirements
    if (!formData.title || formData.title.length < 3) {
      setError('Job title must be at least 3 characters');
      return;
    }
    
    if (!formData.location) {
      setError('Location is required');
      return;
    }
    
    if (!formData.description || formData.description.length < 20) {
      setError('Job description must be at least 20 characters');
      return;
    }
    
    if (!formData.requirements) {
      setError('Requirements are required');
      return;
    }
    
    postJobMutation.mutate(formData);
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Post a New Job
        </Typography>
        
        <Paper sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                name="title"
                label="Job Title"
                required
                variant="outlined"
                value={formData.title}
                onChange={handleTextChange}
              />
              
              <FormControl fullWidth required>
                <InputLabel>Job Type</InputLabel>
                <Select
                  name="jobType"
                  label="Job Type"
                  value={formData.jobType}
                  onChange={handleSelectChange as any}
                >
                  <MenuItem value="full-time">Full-time</MenuItem>
                  <MenuItem value="part-time">Part-time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                name="location"
                label="Location"
                required
                variant="outlined"
                value={formData.location}
                onChange={handleTextChange}
              />
              
              <TextField
                fullWidth
                name="salary"
                label="Salary Range"
                variant="outlined"
                placeholder="e.g., $80,000 - $100,000"
                value={formData.salary}
                onChange={handleTextChange}
              />
              
              <TextField
                fullWidth
                name="description"
                label="Job Description"
                required
                multiline
                rows={6}
                variant="outlined"
                value={formData.description}
                onChange={handleTextChange}
              />
              
              <TextField
                fullWidth
                name="requirements"
                label="Requirements (one per line)"
                required
                multiline
                rows={4}
                variant="outlined"
                placeholder="e.g.,\n3+ years of experience with React\nStrong TypeScript skills\nFamiliarity with REST APIs"
                value={formData.requirements}
                onChange={handleTextChange}
              />
              
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={postJobMutation.isPending}
                >
                  {postJobMutation.isPending ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                      Posting...
                    </>
                  ) : (
                    'Post Job'
                  )}
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};
