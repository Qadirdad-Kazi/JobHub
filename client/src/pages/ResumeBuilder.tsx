import { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const steps = ['Personal Info', 'Experience', 'Education', 'Skills'];

export const ResumeBuilder = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from auth context
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      website: ''
    },
    education: [{
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: ''
    }],
    experience: [{
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    }],
    skills: [] as string[],
    projects: [{
      name: '',
      description: '',
      technologies: [] as string[],
      link: ''
    }]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Use user data from auth context and fetch additional data if needed
  useEffect(() => {
    const initializeFormData = async () => {
      try {
        // If we have user data from auth context, use it
        if (user) {
          console.log('Using user data from auth context:', user);
          
          // Update form data with user information
          setFormData(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              email: user.email || '',
              phone: user.phone || '',
              location: user.location || '',
              website: user.website || ''
            },
            skills: user.skills || []
          }));
        } else {
          // If no user in context, try to fetch directly
          console.log('No user in auth context, fetching from API');
          try {
            const response = await api.get('/api/auth/me');
            
            if (response.data) {
              console.log('Fetched user data from API:', response.data);
              
              // Update form data with user information
              setFormData(prev => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  name: response.data.name || `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim(),
                  email: response.data.email || '',
                  phone: response.data.phone || '',
                  location: response.data.location || '',
                  website: response.data.website || ''
                },
                skills: response.data.skills || []
              }));
            }
          } catch (apiError) {
            console.error('Failed to fetch user data from API:', apiError);
          }
        }
      } catch (error) {
        console.error('Error initializing form data:', error);
      }
    };
    
    initializeFormData();
  }, [user]);  // Re-run when user changes

  // Handle form field changes
  const handleChange = (section: string, field: string, value: string, index?: number) => {
    setFormData(prev => {
      if (section === 'skills') {
        // Handle skills as an array
        return {
          ...prev,
          skills: value.split(',').map(skill => skill.trim())
        };
      } else if (section === 'education' && index !== undefined) {
        // Handle education array updates
        const newEducation = [...prev.education];
        newEducation[index] = {
          ...newEducation[index],
          [field]: value
        };
        return {
          ...prev,
          education: newEducation
        };
      } else if (section === 'experience' && index !== undefined) {
        // Handle experience array updates
        const newExperience = [...prev.experience];
        newExperience[index] = {
          ...newExperience[index],
          [field]: value
        };
        return {
          ...prev,
          experience: newExperience
        };
      } else if (section === 'projects' && index !== undefined) {
        // Handle projects array updates
        const newProjects = [...prev.projects];
        if (field === 'technologies') {
          newProjects[index] = {
            ...newProjects[index],
            technologies: value.split(',').map(tech => tech.trim())
          };
        } else {
          newProjects[index] = {
            ...newProjects[index],
            [field]: value
          };
        }
        return {
          ...prev,
          projects: newProjects
        };
      } else if (section === 'personalInfo') {
        // Handle personal info updates
        return {
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            [field]: value
          }
        };
      }
      return prev;
    });
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Try to save to the database
      console.log('Attempting to save resume to database...');
      
      // Log the form data for debugging
      console.log('Form Data:', {
        personalInfo: formData.personalInfo,
        education: formData.education,
        experience: formData.experience,
        skills: formData.skills,
        projects: formData.projects
      });

      // Prepare the request data - only include non-empty values
      const requestData = {
        title: formData.personalInfo.name ? `${formData.personalInfo.name}'s Resume` : 'Draft Resume',
        content: {
          personalInfo: {
            name: formData.personalInfo.name?.trim() || undefined,
            email: formData.personalInfo.email?.trim() || undefined,
            phone: formData.personalInfo.phone?.trim() || undefined,
            location: formData.personalInfo.location?.trim() || undefined,
            // Only include website if it's a valid URL
            website: formData.personalInfo.website?.trim() ? 
              (formData.personalInfo.website.startsWith('http') ? 
                formData.personalInfo.website.trim() : 
                `https://${formData.personalInfo.website.trim()}`
              ) : null
          },
          education: formData.education
            .filter(edu => edu.school || edu.degree || edu.fieldOfStudy)
            .map(edu => ({
              school: edu.school?.trim() || undefined,
              degree: edu.degree?.trim() || undefined,
              fieldOfStudy: edu.fieldOfStudy?.trim() || undefined,
              startDate: edu.startDate || new Date().toISOString().split('T')[0],
              endDate: edu.endDate || null,
              description: edu.description?.trim() || undefined
            })),
          experience: formData.experience
            .filter(exp => exp.company || exp.position || exp.description)
            .map(exp => ({
              company: exp.company?.trim() || undefined,
              position: exp.position?.trim() || undefined,
              location: exp.location?.trim() || undefined,
              startDate: exp.startDate || new Date().toISOString().split('T')[0],
              endDate: exp.endDate || null,
              description: exp.description?.trim() || undefined
            })),
          skills: formData.skills
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0),
          projects: formData.projects
            .filter(project => project.name || project.description || project.technologies.length > 0)
            .map(project => ({
              name: project.name?.trim() || undefined,
              description: project.description?.trim() || undefined,
              technologies: project.technologies
                .map(tech => tech.trim())
                .filter(tech => tech.length > 0),
              link: project.link?.trim() ? 
                (project.link.startsWith('http') ? 
                  project.link.trim() : 
                  `https://${project.link.trim()}`
                ) : null
            }))
        }
      };

      // Log the final request data
      console.log('Request Data:', JSON.stringify(requestData, null, 2));

      const response = await api.post('/api/resumes', requestData);
      
      console.log('Resume created successfully:', response.data);
      
      // Show success message
      setSnackbarMessage('Resume draft saved successfully! You can update it later.');
      setSnackbarOpen(true);
      
      // Move to the completion step
      setActiveStep(prevStep => prevStep + 1);
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (error: any) {
      console.error('Error saving resume:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Server Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Log validation errors in detail if they exist
        if (error.response.data?.errors) {
          console.error('Validation Errors:', error.response.data.errors.map((err: any) => ({
            field: err.path?.join('.'),
            message: err.message,
            code: err.code
          })));
        }
        
        // Set a more specific error message based on the response
        const serverErrorMessage = error.response.data?.message || 'Unknown server error';
        setSubmitError(`Failed to save resume: ${serverErrorMessage}`);
      } else if (error.request) {
        console.error('Request Error:', {
          message: 'No response received from server',
          request: error.request
        });
        setSubmitError('Failed to connect to server. Please try again.');
      } else {
        console.error('Error Details:', {
          message: error.message,
          stack: error.stack
        });
        setSubmitError(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Personal Information</Typography>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              value={formData.personalInfo.name}
              onChange={(e) => handleChange('personalInfo', 'name', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              value={formData.personalInfo.email}
              onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
              required
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
              label="Location"
              variant="outlined"
              value={formData.personalInfo.location}
              onChange={(e) => handleChange('personalInfo', 'location', e.target.value)}
            />
            <TextField
              fullWidth
              label="Website"
              variant="outlined"
              value={formData.personalInfo.website}
              onChange={(e) => handleChange('personalInfo', 'website', e.target.value)}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Work Experience</Typography>
            {formData.experience.map((exp, index) => (
              <Box key={index} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle1">Experience {index + 1}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    fullWidth
                    label="Company"
                    variant="outlined"
                    value={exp.company}
                    onChange={(e) => handleChange('experience', 'company', e.target.value, index)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Position"
                    variant="outlined"
                    value={exp.position}
                    onChange={(e) => handleChange('experience', 'position', e.target.value, index)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Location"
                    variant="outlined"
                    value={exp.location}
                    onChange={(e) => handleChange('experience', 'location', e.target.value, index)}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        value={exp.startDate}
                        onChange={(e) => handleChange('experience', 'startDate', e.target.value, index)}
                        required
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        value={exp.endDate}
                        onChange={(e) => handleChange('experience', 'endDate', e.target.value, index)}
                      />
                    </Box>
                  </Box>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    variant="outlined"
                    value={exp.description}
                    onChange={(e) => handleChange('experience', 'description', e.target.value, index)}
                    required
                  />
                </Box>
              </Box>
            ))}
            <Button 
              variant="outlined" 
              onClick={() => setFormData(prev => ({
                ...prev,
                experience: [...prev.experience, {
                  company: '',
                  position: '',
                  location: '',
                  startDate: '',
                  endDate: '',
                  description: ''
                }]
              }))}
            >
              Add Experience
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Education</Typography>
            {formData.education.map((edu, index) => (
              <Box key={index} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle1">Education {index + 1}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    fullWidth
                    label="School"
                    variant="outlined"
                    value={edu.school}
                    onChange={(e) => handleChange('education', 'school', e.target.value, index)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Degree"
                    variant="outlined"
                    value={edu.degree}
                    onChange={(e) => handleChange('education', 'degree', e.target.value, index)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Field of Study"
                    variant="outlined"
                    value={edu.fieldOfStudy}
                    onChange={(e) => handleChange('education', 'fieldOfStudy', e.target.value, index)}
                    required
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        value={edu.startDate}
                        onChange={(e) => handleChange('education', 'startDate', e.target.value, index)}
                        required
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        value={edu.endDate}
                        onChange={(e) => handleChange('education', 'endDate', e.target.value, index)}
                      />
                    </Box>
                  </Box>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    variant="outlined"
                    value={edu.description}
                    onChange={(e) => handleChange('education', 'description', e.target.value, index)}
                  />
                </Box>
              </Box>
            ))}
            <Button 
              variant="outlined" 
              onClick={() => setFormData(prev => ({
                ...prev,
                education: [...prev.education, {
                  school: '',
                  degree: '',
                  fieldOfStudy: '',
                  startDate: '',
                  endDate: '',
                  description: ''
                }]
              }))}
            >
              Add Education
            </Button>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Skills</Typography>
            <TextField
              fullWidth
              label="Skills"
              multiline
              rows={4}
              variant="outlined"
              placeholder="Enter your skills separated by commas (e.g. JavaScript, React, Node.js)"
              value={formData.skills.join(', ')}
              onChange={(e) => handleChange('skills', '', e.target.value)}
              required
            />
            
            <Typography variant="h6" sx={{ mt: 2 }}>Projects (Optional)</Typography>
            {formData.projects.map((project, index) => (
              <Box key={index} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle1">Project {index + 1}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    variant="outlined"
                    value={project.name}
                    onChange={(e) => handleChange('projects', 'name', e.target.value, index)}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={2}
                    variant="outlined"
                    value={project.description}
                    onChange={(e) => handleChange('projects', 'description', e.target.value, index)}
                  />
                  <TextField
                    fullWidth
                    label="Technologies Used"
                    variant="outlined"
                    placeholder="Enter technologies separated by commas"
                    value={project.technologies.join(', ')}
                    onChange={(e) => handleChange('projects', 'technologies', e.target.value, index)}
                  />
                  <TextField
                    fullWidth
                    label="Project Link"
                    variant="outlined"
                    value={project.link}
                    onChange={(e) => handleChange('projects', 'link', e.target.value, index)}
                  />
                </Box>
              </Box>
            ))}
            <Button 
              variant="outlined" 
              onClick={() => setFormData(prev => ({
                ...prev,
                projects: [...prev.projects, {
                  name: '',
                  description: '',
                  technologies: [],
                  link: ''
                }]
              }))}
            >
              Add Project
            </Button>
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
        <Typography variant="body1" sx={{ mb: 3 }}>
          Create your professional resume to use when applying for jobs
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
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ mt: 2 }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity="success" 
            variant="filled"
            sx={{ 
              width: '100%', 
              boxShadow: 3,
              fontSize: '1rem',
              fontWeight: 'medium'
            }}
          >
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
                <Button onClick={() => setActiveStep(0)}>Create Another Resume</Button>
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
      
      {/* Snackbar for loading message */}
      <Snackbar 
        open={isSubmitting} 
        autoHideDuration={6000}
      >
        <Alert severity="info" icon={<CircularProgress size={20} />}>
          Creating your resume...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ResumeBuilder;
