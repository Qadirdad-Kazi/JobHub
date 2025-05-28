import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import EmployerAnalytics from '../components/EmployerAnalytics';
import JobAnalytics from '../components/JobAnalytics';

export const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Fetch employer's jobs
  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['employerJobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs/employer');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    }
  });
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    if (newValue !== 'job-analytics') {
      setSelectedJobId(null);
    }
  };
  
  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setActiveTab('job-analytics');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Employer Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/post-job')}
          >
            Post New Job
          </Button>
        </Box>
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 4 }}
        >
          <Tab value="overview" label="Overview" />
          <Tab value="analytics" label="Analytics" />
          {selectedJobId && <Tab value="job-analytics" label="Job Analytics" />}
        </Tabs>
        
        {activeTab === 'overview' && (
          <Stack spacing={4} width="100%">
            {/* Statistics Cards - These will be replaced by real data from the analytics */}
            <Box width="100%">
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Active Jobs
                      </Typography>
                      <Typography variant="h4">{jobs?.length || 0}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Applications
                      </Typography>
                      <Typography variant="h4">--</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Interviews Scheduled
                      </Typography>
                      <Typography variant="h4">--</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Positions Filled
                      </Typography>
                      <Typography variant="h4">--</Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Stack>
            </Box>
            
            {/* Recent Job Postings */}
            <Box width={{ xs: '100%', md: '50%' }} px={1}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Job Postings
                </Typography>
                <List>
                  {isLoadingJobs ? (
                    <ListItem>
                      <ListItemText primary="Loading jobs..." />
                    </ListItem>
                  ) : jobs && jobs.length > 0 ? (
                    jobs.slice(0, 5).map((job: any) => (
                      <ListItem key={job._id}>
                        <ListItemText 
                          primary={job.title}
                          secondary={`Posted ${new Date(job.createdAt).toLocaleDateString()}`}
                        />
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => handleJobSelect(job._id)}
                        >
                          Analytics
                        </Button>
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No jobs posted yet" />
                    </ListItem>
                  )}
                </List>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button variant="outlined" onClick={() => navigate('/employer/jobs')}>
                    View All Jobs
                  </Button>
                </Box>
              </Paper>
            </Box>
            
            {/* Recent Applications */}
            <Box width={{ xs: '100%', md: '50%' }} px={1}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Applications
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="John Doe - Senior React Developer"
                      secondary="Applied 1 day ago"
                    />
                    <Chip label="New" color="info" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Jane Smith - UX Designer"
                      secondary="Applied 3 days ago"
                    />
                    <Chip label="Reviewed" color="primary" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Mike Johnson - Product Manager"
                      secondary="Applied 5 days ago"
                    />
                    <Chip label="Interview" color="warning" size="small" />
                  </ListItem>
                </List>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button variant="outlined" onClick={() => navigate('/employer/applications')}>
                    View All Applications
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Stack>
        )}
        
        {activeTab === 'analytics' && (
          <EmployerAnalytics />
        )}
        
        {activeTab === 'job-analytics' && selectedJobId && (
          <JobAnalytics jobId={selectedJobId} />
        )}
      </Box>
    </Container>
  );
};
