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
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListItemText
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const steps = ['Personal Info', 'Experience', 'Education', 'Skills'];

export const ResumeBuilder = (): JSX.Element => {
  const navigate = useNavigate();
  const { resumeId } = useParams(); // Get resumeId from URL if editing
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [existingResumes, setExistingResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch user's resumes
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await api.get('/api/resumes');
        setExistingResumes(response.data);
        
        // If resumeId is provided in URL, select that resume
        if (resumeId) {
          setSelectedResumeId(resumeId);
          const selectedResume = response.data.find((r: any) => r._id === resumeId);
          if (selectedResume) {
            loadResumeData(selectedResume);
          }
        }
      } catch (error) {
        console.error('Error fetching resumes:', error);
      }
    };
    
    fetchResumes();
  }, [resumeId]);

  // Function to load resume data into form
  const loadResumeData = (resume: any) => {
    setFormData({
      personalInfo: {
        name: resume.content.personalInfo.name || '',
        email: resume.content.personalInfo.email || '',
        phone: resume.content.personalInfo.phone || '',
        location: resume.content.personalInfo.location || '',
        website: resume.content.personalInfo.website || ''
      },
      education: resume.content.education.length > 0 ? resume.content.education.map((edu: any) => ({
        school: edu.school || '',
        degree: edu.degree || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
        endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
        description: edu.description || ''
      })) : [{
        school: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        description: ''
      }],
      experience: resume.content.experience.length > 0 ? resume.content.experience.map((exp: any) => ({
        company: exp.company || '',
        position: exp.position || '',
        location: exp.location || '',
        startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
        endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
        description: exp.description || ''
      })) : [{
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        description: ''
      }],
      skills: Array.isArray(resume.content.skills) ? resume.content.skills.filter(Boolean) : [],
      projects: resume.content.projects.length > 0 ? resume.content.projects.map((proj: any) => ({
        name: proj.name || '',
        description: proj.description || '',
        technologies: Array.isArray(proj.technologies) ? proj.technologies.filter(Boolean) : [],
        link: proj.link || ''
      })) : [{
        name: '',
        description: '',
        technologies: [],
        link: ''
      }]
    });
  };

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
      // Prepare the request data
      const requestData = {
        title: formData.personalInfo.name ? `${formData.personalInfo.name}'s Resume` : 'Draft Resume',
        content: {
          personalInfo: {
            name: formData.personalInfo.name?.trim() || undefined,
            email: formData.personalInfo.email?.trim() || undefined,
            phone: formData.personalInfo.phone?.trim() || undefined,
            location: formData.personalInfo.location?.trim() || undefined,
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

      let response;
      if (selectedResumeId) {
        // Update existing resume
        response = await api.put(`/api/resumes/${selectedResumeId}`, requestData);
        setSnackbarMessage('Resume updated successfully!');
      } else {
        // Create new resume
        response = await api.post('/api/resumes', requestData);
        setSnackbarMessage('Resume created successfully!');
      }

      setSnackbarOpen(true);
      setActiveStep(prevStep => prevStep + 1);

      // Redirect to profile page after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (error: any) {
      console.error('Error saving resume:', error);
      handleSubmitError(error);
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

  // Add handleSubmitError function
  const handleSubmitError = (error: any) => {
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
  };

  // Add delete resume function
  const handleDeleteResume = async (resumeId: string) => {
    try {
      setIsDeleting(true);
      await api.delete(`/api/resumes/${resumeId}`);
      
      // Update the resumes list
      setExistingResumes(prevResumes => prevResumes.filter(resume => resume._id !== resumeId));
      
      // If the deleted resume was selected, reset the form
      if (selectedResumeId === resumeId) {
        setSelectedResumeId(null);
        setFormData({
          personalInfo: { name: '', email: '', phone: '', location: '', website: '' },
          education: [{ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }],
          experience: [{ company: '', position: '', location: '', startDate: '', endDate: '', description: '' }],
          skills: [],
          projects: [{ name: '', description: '', technologies: [], link: '' }]
        });
      }

      setSnackbarMessage('Resume deleted successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting resume:', error);
      setSubmitError('Failed to delete resume. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
    }
  };

  // Modify ResumeSelector component
  const ResumeSelector = () => (
    <Box sx={{ mb: 4 }}>
      <FormControl fullWidth>
        <InputLabel>Select Existing Resume</InputLabel>
        <Select
          value={selectedResumeId || ''}
          onChange={(e) => {
            const newResumeId = e.target.value;
            setSelectedResumeId(newResumeId);
            const selectedResume = existingResumes.find(r => r._id === newResumeId);
            if (selectedResume) {
              loadResumeData(selectedResume);
            } else {
              // Reset form if "Create New" is selected
              setFormData({
                personalInfo: { name: '', email: '', phone: '', location: '', website: '' },
                education: [{ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }],
                experience: [{ company: '', position: '', location: '', startDate: '', endDate: '', description: '' }],
                skills: [],
                projects: [{ name: '', description: '', technologies: [], link: '' }]
              });
            }
          }}
        >
          <MenuItem value="">Create New Resume</MenuItem>
          {existingResumes.map((resume) => (
            <MenuItem 
              key={resume._id} 
              value={resume._id}
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <ListItemText 
                primary={resume.title || 'Untitled Resume'}
                secondary={`Last updated: ${new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}`}
              />
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setResumeToDelete(resume._id);
                  setDeleteDialogOpen(true);
                }}
                sx={{ ml: 1 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Resume</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this resume? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => resumeToDelete && handleDeleteResume(resumeToDelete)}
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {selectedResumeId ? 'Update Resume' : 'Create Resume'}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {selectedResumeId ? 'Update your existing resume' : 'Create a new professional resume'}
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ p: 4 }}>
            <ResumeSelector />
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
                  {selectedResumeId ? 'Resume updated successfully!' : 'Resume created successfully!'}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                  <Box sx={{ flex: '1 1 auto' }} />
                  <Button onClick={() => {
                    setSelectedResumeId(null);
                    setActiveStep(0);
                    setFormData({
                      personalInfo: { name: '', email: '', phone: '', location: '', website: '' },
                      education: [{ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }],
                      experience: [{ company: '', position: '', location: '', startDate: '', endDate: '', description: '' }],
                      skills: [],
                      projects: [{ name: '', description: '', technologies: [], link: '' }]
                    });
                  }}>Create Another Resume</Button>
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
                    {activeStep === steps.length - 1 ? (
                      isSubmitting ? (
                        selectedResumeId ? 'Updating...' : 'Creating...'
                      ) : (
                        selectedResumeId ? 'Update Resume' : 'Create Resume'
                      )
                    ) : (
                      'Next'
                    )}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        )}
      </Box>
      
      {/* Snackbar for loading message */}
      <Snackbar 
        open={isSubmitting} 
        autoHideDuration={6000}
      >
        <Alert severity="info" icon={<CircularProgress size={20} />}>
          {selectedResumeId ? 'Updating your resume...' : 'Creating your resume...'}
        </Alert>
      </Snackbar>

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
    </Container>
  );
};

export default ResumeBuilder;
