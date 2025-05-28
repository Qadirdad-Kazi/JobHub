import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Card,
  CardContent,
  Stack,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Application, Job } from '@shared/schema';

export const JobSeekerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch user's applications
  const { data: applications, isLoading: isLoadingApplications } = useQuery<Application[]>({
    queryKey: ['/api/applications/me'],
  });

  // Fetch personalized job recommendations
  const { data: recommendedJobsResponse, isLoading: isLoadingJobs } = useQuery<{data: Job[]}>({ 
    queryKey: ['recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/recommendations?limit=3');
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      return response.json();
    }
  });
  
  const recommendedJobs: Job[] = recommendedJobsResponse?.data || [];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Dashboard
        </Typography>

        <Stack spacing={4} width="100%">
          {/* Statistics Cards */}
          <Box width="100%">
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Applications
                    </Typography>
                    <Typography variant="h4">
                      {isLoadingApplications ? '...' : applications?.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Interviews
                    </Typography>
                    <Typography variant="h4">
                      {isLoadingApplications ? '...' : 
                        applications?.filter(app => app.status === 'interviewing')?.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Saved Jobs
                    </Typography>
                    <Typography variant="h4">
                      {/* TODO: Implement saved jobs feature */}
                      0
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Profile Views
                    </Typography>
                    <Typography variant="h4">
                      {/* TODO: Implement profile views tracking */}
                      0
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </Box>

          {/* Recent Applications */}
          <Box width={{ xs: '100%', md: '66.67%' }} px={1}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Applications
                </Typography>
                <Button variant="outlined" size="small" onClick={() => navigate('/applications')}>
                  View All
                </Button>
              </Box>
              {isLoadingApplications ? (
                <Typography>Loading applications...</Typography>
              ) : applications && applications.length > 0 ? (
                <List>
                  {applications.slice(0, 3).map((application) => (
                    <ListItem
                      key={application._id}
                      sx={{ mb: 2, border: 1, borderColor: 'grey.200', borderRadius: 1 }}
                    >
                      <ListItemText
                        primary={typeof application.jobId === 'object' ? application.jobId.title : 'Job Title Not Available'}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {typeof application.jobId === 'object' ? application.jobId.company : 'Company Not Available'}
                            </Typography>
                            {` — Applied on ${new Date(application.appliedAt).toLocaleDateString()}`}
                          </React.Fragment>
                        }
                      />
                      <Chip 
                        label={application.status.charAt(0).toUpperCase() + application.status.slice(1)} 
                        color={application.status === 'pending' ? 'default' : 
                               application.status === 'interviewing' ? 'primary' : 
                               application.status === 'hired' ? 'success' : 'error'} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No applications yet</Typography>
              )}
            </Paper>
          </Box>

          {/* Profile and Resume Section */}
          <Box width={{ xs: '100%', md: '33.33%' }} px={1}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Profile Completion
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Complete your profile to increase visibility
                </Typography>
                <Typography variant="h5" sx={{ mt: 1 }}>
                  {/* TODO: Implement profile completion calculation */}
                  80%
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate('/profile')}
              >
                Complete Profile
              </Button>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resume
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Keep your resume up to date
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate('/resume-builder')}
              >
                Update Resume
              </Button>
            </Paper>
          </Box>

          {/* Recommended Jobs */}
          <Box width="100%" px={1}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recommended Jobs
                </Typography>
                <Button variant="outlined" size="small" onClick={() => navigate('/jobs')}>
                  View All
                </Button>
              </Box>
              {isLoadingJobs ? (
                <Typography>Loading jobs...</Typography>
              ) : recommendedJobs && recommendedJobs.length > 0 ? (
                <Stack direction="row" spacing={3} flexWrap="wrap">
                  {recommendedJobs.map((job: Job) => (
                    <Box width={{ xs: '100%', md: '33.33%' }} px={1} key={job._id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {job.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {job.company} • {job.location}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {job.salary ? 
                              `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}` 
                              : 'Salary not specified'} • {job.type}
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => navigate(`/jobs/${job._id}`)}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography>No recommended jobs available</Typography>
              )}
            </Paper>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
};
