import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Divider,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@shared/schema';

// Define application status options
const APPLICATION_STATUSES = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

// Define the interface for the application data
interface ApplicationDetails {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    bio?: string;
    location?: string;
    skills?: string[];
    profileImage?: string;
  };
  resumeId: {
    _id: string;
    title: string;
    content: {
      personalInfo: {
        name?: string;
        email?: string;
        phone?: string;
        location?: string;
        website?: string;
      };
      education: Array<{
        school?: string;
        degree?: string;
        fieldOfStudy?: string;
        startDate?: string;
        endDate?: string | null;
        description?: string;
      }>;
      experience: Array<{
        company?: string;
        position?: string;
        location?: string;
        startDate?: string;
        endDate?: string | null;
        description?: string;
      }>;
      skills: string[];
      projects: Array<{
        name?: string;
        description?: string;
        technologies?: string[];
        link?: string;
      }>;
    };
  };
  status: string;
  notes?: string;
  coverLetter?: string;
  appliedAt: string;
  updatedAt: string;
  createdAt: string;
}

export const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openContactDialog, setOpenContactDialog] = useState(false);

  // Fetch application details
  const { data: application, isLoading, isError } = useQuery<ApplicationDetails, Error>({
    queryKey: [`/api/applications/${id}`],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/applications/${id}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching application details:', error);
        throw error;
      }
    },
    enabled: !!id && !!user && user.role === UserRole.EMPLOYER,
  });
  
  // Set status and notes when application data is loaded
  React.useEffect(() => {
    if (application) {
      setStatus(application.status);
      setNotes(application.notes || '');
    }
  }, [application]);

  // Update application status mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async (data: { status: string; notes?: string }) => {
      const response = await api.put(`/api/applications/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess('Application status updated successfully');
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/applications'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to update application status');
      setTimeout(() => setError(null), 3000);
    },
  });

  // Handle status update
  const handleUpdateStatus = () => {
    updateApplicationMutation.mutate({ status, notes });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'reviewed':
        return 'info';
      case 'interviewing':
        return 'primary';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle contact dialog
  const handleOpenContactDialog = () => setOpenContactDialog(true);
  const handleCloseContactDialog = () => setOpenContactDialog(false);

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError || !application) {
    return (
      <Container maxWidth="lg">
        <Box my={4}>
          <Alert severity="error">
            Error loading application details. The application may not exist or you may not have permission to view it.
          </Alert>
          <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  // Check if the current user is the employer who posted the job
  const isEmployer = user?.role === UserRole.EMPLOYER;
  if (!isEmployer) {
    return (
      <Container maxWidth="lg">
        <Box my={4}>
          <Alert severity="error">
            You do not have permission to view this application.
          </Alert>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Go Home
          </Button>
        </Box>
      </Container>
    );
  }

  // If application is not loaded yet, don't try to access its properties
  if (!application) {
    return (
      <Container maxWidth="lg">
        <Box my={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              Application Details
            </Typography>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Box>

          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress />
            </Box>
          ) : (
            <Alert severity="error">
              Error loading application details. The application may not exist or you may not have permission to view it.
            </Alert>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Application Details
          </Typography>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
          {/* Left column - Job and Application Info */}
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Job Details
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {application?.jobId?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {application?.jobId?.company} • {application?.jobId?.location}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Type:</strong> {application?.jobId?.type}
              </Typography>
              {application?.jobId?.salary && (
                <Typography variant="body2" gutterBottom>
                  <strong>Salary:</strong>{' '}
                  {application?.jobId?.salary?.min && application?.jobId?.salary?.max
                    ? `${application?.jobId?.salary?.currency || 'USD'} ${application?.jobId?.salary?.min.toLocaleString()} - ${application?.jobId?.salary?.max.toLocaleString()}`
                    : 'Not specified'}
                </Typography>
              )}
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Application Status
                </Typography>
                <Chip
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                  color={getStatusColor(status) as any}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2">
                  <strong>Applied:</strong> {formatDate(application?.appliedAt)}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Updated:</strong> {formatDate(application?.updatedAt)}
                </Typography>
              </Box>
            </Paper>

            {/* Update Status Section */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Update Status
              </Typography>
              <TextField
                select
                fullWidth
                label="Application Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                margin="normal"
              >
                {APPLICATION_STATUSES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Notes (Internal)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                margin="normal"
                multiline
                rows={4}
                placeholder="Add internal notes about this candidate"
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleUpdateStatus}
                disabled={updateApplicationMutation.isPending}
                sx={{ mt: 2 }}
              >
                {updateApplicationMutation.isPending ? <CircularProgress size={24} /> : 'Update Status'}
              </Button>
            </Paper>
          </Box>

          {/* Right column - Applicant Details */}
          <Box>
            {/* Applicant Information */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Applicant Information
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleOpenContactDialog}
                >
                  Contact Applicant
                </Button>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2">
                    <strong>Name:</strong> {application?.userId?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {application?.userId?.email}
                  </Typography>
                  {application?.userId?.location && (
                    <Typography variant="body2">
                      <strong>Location:</strong> {application?.userId?.location}
                    </Typography>
                  )}
                </Box>
                <Box>
                  {application?.userId?.skills && application?.userId?.skills.length > 0 && (
                    <>
                      <Typography variant="body2" gutterBottom>
                        <strong>Skills:</strong>
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {application?.userId?.skills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              </Box>

              {application?.userId?.bio && (
                <Box mt={2}>
                  <Typography variant="body2">
                    <strong>Bio:</strong>
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {application?.userId?.bio}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Resume Section */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resume
              </Typography>
              
              {/* Education */}
              <Typography variant="subtitle1" gutterBottom>
                Education
              </Typography>
              {application?.resumeId?.content?.education?.length > 0 ? (
                <List disablePadding>
                  {application?.resumeId?.content?.education?.map((edu, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="medium">
                            {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" display="block">
                              {edu.school}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" component="span">
                              {edu.startDate && new Date(edu.startDate).getFullYear()} - 
                              {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                            </Typography>
                            {edu.description && (
                              <Typography variant="body2" color="text.secondary" component="span" display="block">
                                {edu.description}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No education information provided
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              {/* Experience */}
              <Typography variant="subtitle1" gutterBottom>
                Experience
              </Typography>
              {application?.resumeId?.content?.experience?.length > 0 ? (
                <List disablePadding>
                  {application?.resumeId?.content?.experience?.map((exp, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="medium">
                            {exp.position} at {exp.company}
                          </Typography>
                        }
                        secondary={
                          <>
                            {exp.location && (
                              <Typography variant="body2" component="span" display="block">
                                {exp.location}
                              </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary" component="span">
                              {exp.startDate && new Date(exp.startDate).getFullYear()} - 
                              {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                            </Typography>
                            {exp.description && (
                              <Typography variant="body2" color="text.secondary" component="span" display="block">
                                {exp.description}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No experience information provided
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              {/* Projects */}
              <Typography variant="subtitle1" gutterBottom>
                Projects
              </Typography>
              {application?.resumeId?.content?.projects?.length > 0 ? (
                <List disablePadding>
                  {application?.resumeId?.content?.projects?.map((project, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="medium">
                            {project.name}
                            {project.link && (
                              <Button
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                sx={{ ml: 1 }}
                              >
                                Link
                              </Button>
                            )}
                          </Typography>
                        }
                        secondary={
                          <>
                            {project.description && (
                              <Typography variant="body2" color="text.secondary" component="span" display="block">
                                {project.description}
                              </Typography>
                            )}
                            {project.technologies && project.technologies.length > 0 && (
                              <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                                {project.technologies.map((tech, i) => (
                                  <Chip key={i} label={tech} size="small" variant="outlined" />
                                ))}
                              </Box>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No project information provided
                </Typography>
              )}
            </Paper>

            {/* Cover Letter Section */}
            {application?.coverLetter && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Cover Letter
                </Typography>
                <Typography variant="body1" whiteSpace="pre-line">
                  {application?.coverLetter}
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>

        {/* Contact Dialog */}
        <Dialog open={openContactDialog} onClose={handleCloseContactDialog}>
          <DialogTitle>Contact {application?.userId?.name}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You can contact this applicant directly via email:
            </DialogContentText>
            <Box mt={2}>
              <Typography variant="body1">
                <strong>Email:</strong> {application?.userId?.email}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseContactDialog}>Close</Button>
            <Button
              variant="contained"
              color="primary"
              component="a"
              href={`mailto:${application?.userId?.email}?subject=Regarding your application for ${application?.jobId?.title}`}
              target="_blank"
            >
              Send Email
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ApplicationDetails;
