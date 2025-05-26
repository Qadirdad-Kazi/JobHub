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

  // Fetch recommended jobs
  const { data: recommendedJobs, isLoading: isLoadingJobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs?limit=3'],
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Dashboard
        </Typography>

        <Grid container spacing={4}>
          {/* Statistics Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
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
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Interviews
                    </Typography>
                    <Typography variant="h4">
                      {isLoadingApplications ? '...' : 
                        applications?.filter(app => app.status === 'interview')?.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
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
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
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
              </Grid>
            </Grid>
          </Grid>

          {/* Recent Applications */}
          <Grid item xs={12} md={8}>
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
                        primary={application.job?.title || 'Job Title Not Available'}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {application.job?.company || 'Company Not Available'}
                            </Typography>
                            {` — Applied on ${new Date(application.appliedAt).toLocaleDateString()}`}
                          </React.Fragment>
                        }
                      />
                      <Chip 
                        label={application.status.charAt(0).toUpperCase() + application.status.slice(1)} 
                        color={application.status === 'pending' ? 'default' : 
                               application.status === 'interview' ? 'primary' : 
                               application.status === 'accepted' ? 'success' : 'error'} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No applications yet</Typography>
              )}
            </Paper>
          </Grid>

          {/* Profile and Resume Section */}
          <Grid item xs={12} md={4}>
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
          </Grid>

          {/* Recommended Jobs */}
          <Grid item xs={12}>
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
                <Grid container spacing={3}>
                  {recommendedJobs.map((job) => (
                    <Grid item xs={12} md={4} key={job._id}>
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
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography>No recommended jobs available</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
