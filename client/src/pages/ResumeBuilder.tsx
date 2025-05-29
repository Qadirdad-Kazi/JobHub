import React, { useState } from 'react';
import { 
  Container,
  Typography,
  Paper,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { api } from '../lib/api';

const steps = ['Personal Info', 'Experience', 'Education', 'Skills'];

export const ResumeBuilder: React.FC = (): React.ReactNode => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      summary: ''
    },
    experience: {
      company: '',
      position: '',
      description: '',
      startDate: '',
      endDate: ''
    },
    education: {
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: ''
    },
    skills: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Handle form field changes
  const handleChange = (section: 'personalInfo' | 'experience' | 'education' | 'skills', field: string, value: string) => {
    if (section === 'skills') {
      setFormData(prev => ({
        ...prev,
        skills: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const handleNext = async () => {
    // If we're on the last step, submit the form
    if (activeStep === steps.length - 1) {
      try {
        setIsSubmitting(true);
        setSubmitError(null);
        
        console.log('Submitting resume data:', formData);
        
        // Format the data to match what the server expects
        const formattedData = {
          personalInfo: {
            firstName: formData.personalInfo.firstName || '',
            lastName: formData.personalInfo.lastName || '',
            email: formData.personalInfo.email || '',
            phone: formData.personalInfo.phone || '',
            address: formData.personalInfo.address || '',
            summary: formData.personalInfo.summary || '',
            // Add name field which is required by the model
            name: `${formData.personalInfo.firstName || ''} ${formData.personalInfo.lastName || ''}`,
            // Add website field which might be expected by the model
            website: ''
          },
          // Convert experience to an array as expected by the server
          // If no company is provided, add a placeholder to satisfy the model requirements
          experience: [
            {
              company: formData.experience.company || 'Not specified',
              position: formData.experience.position || 'Not specified',
              description: formData.experience.description || 'Not specified',
              startDate: formData.experience.startDate || new Date().toISOString().split('T')[0],
              endDate: formData.experience.endDate || '',
              location: ''
            }
          ],
          // Convert education to an array as expected by the server
          education: [
            {
              school: formData.education.school || 'Not specified',
              degree: formData.education.degree || 'Not specified',
              // Rename field to fieldOfStudy as expected by the server
              fieldOfStudy: formData.education.field || 'Not specified',
              startDate: formData.education.startDate || new Date().toISOString().split('T')[0],
              endDate: formData.education.endDate || '',
              description: ''
            }
          ],
          // Ensure skills is properly formatted (as string or array)
          skills: formData.skills ? formData.skills.split(',').map((skill: string) => skill.trim()) : ['Not specified']
        };
        
        console.log('Formatted resume data:', formattedData);
        
        try {
          // Send the resume data to the server
          console.log('Sending resume data to server:', formattedData);
          
          // Send to the API with the correct endpoint
          // The api instance already has baseURL set to '/api', so we don't need to include it here
          const response = await api.post('/resumes', formattedData);
          console.log('Resume saved to database:', response.data);
          
          // Show success message
          setSnackbarMessage('Resume created successfully!');
          setSnackbarOpen(true);
        } catch (error) {
          console.error('Error saving resume to database:', error);
          setSubmitError('Failed to save resume to database. Please try again.');
          return; // Don't proceed to next step if saving fails
        }
        
        // Move to the completion step
        setActiveStep((prevStep) => prevStep + 1);
      } catch (error) {
        console.error('Error creating resume:', error);
        setSubmitError('Failed to create resume. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Just move to the next step if not the last step
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="First Name"
                  required
                  variant="outlined"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handleChange('personalInfo', 'firstName', e.target.value)}
                />
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  required
                  variant="outlined"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handleChange('personalInfo', 'lastName', e.target.value)}
                />
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Email"
              required
              type="email"
              variant="outlined"
              value={formData.personalInfo.email}
              onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
            />
            <TextField
              fullWidth
              label="Phone"
              variant="outlined"
              value={formData.personalInfo.phone}
              onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)}
            />
            <TextField
              fullWidth
              label="Professional Summary"
              multiline
              rows={4}
              variant="outlined"
              value={formData.personalInfo.summary}
              onChange={(e) => handleChange('personalInfo', 'summary', e.target.value)}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Company Name"
              variant="outlined"
              value={formData.experience.company}
              onChange={(e) => handleChange('experience', 'company', e.target.value)}
            />
            <TextField
              fullWidth
              label="Position"
              variant="outlined"
              value={formData.experience.position}
              onChange={(e) => handleChange('experience', 'position', e.target.value)}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  value={formData.experience.startDate}
                  onChange={(e) => handleChange('experience', 'startDate', e.target.value)}
                />
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  value={formData.experience.endDate}
                  onChange={(e) => handleChange('experience', 'endDate', e.target.value)}
                />
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Job Description"
              multiline
              rows={4}
              variant="outlined"
              value={formData.experience.description}
              onChange={(e) => handleChange('experience', 'description', e.target.value)}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="School Name"
              variant="outlined"
              value={formData.education.school}
              onChange={(e) => handleChange('education', 'school', e.target.value)}
            />
            <TextField
              fullWidth
              label="Degree"
              variant="outlined"
              value={formData.education.degree}
              onChange={(e) => handleChange('education', 'degree', e.target.value)}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  value={formData.education.startDate}
                  onChange={(e) => handleChange('education', 'startDate', e.target.value)}
                />
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  value={formData.education.endDate}
                  onChange={(e) => handleChange('education', 'endDate', e.target.value)}
                />
              </Box>
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Skills"
              multiline
              rows={4}
              variant="outlined"
              placeholder="Enter your skills separated by commas"
              value={formData.skills}
              onChange={(e) => handleChange('skills', '', e.target.value)}
            />
          </Box>
        );
      default:
        return null;
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Resume Builder
        </Typography>
        
        {/* Show error message if there's an error */}
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        
        <Paper sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === steps.length ? (
            <Box>
              <Typography sx={{ mt: 2, mb: 1 }}>
                All steps completed - you're finished
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={() => setActiveStep(0)}>Reset</Button>
              </Box>
            </Box>
          ) : (
            <Box>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {activeStep === steps.length - 1 ? (isSubmitting ? 'Creating...' : 'Finish') : 'Next'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Snackbar for success message */}
      <Snackbar 
        open={isSubmitting} 
        autoHideDuration={6000}
      >
        <Alert severity="info">
          Creating your resume...
        </Alert>
      </Snackbar>
    </Container>
  );
};
