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
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import EmployerAnalytics from '../components/EmployerAnalytics';
import JobAnalytics from '../components/JobAnalytics';
import { useAuth } from '../context/AuthContext';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  postedBy: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  createdAt: string;
  updatedAt: string;
  status?: string;
}

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    status: string;
    postedBy: {
      _id: string;
      name: string;
      company: string;
    };
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    bio?: string;
    location?: string;
    skills?: string[];
  };
  status: 'pending' | 'interview' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  activeJobs: number;
  totalJobs: number;
  totalApplications: number;
  interviewsScheduled: number;
  positionsFilled: number;
}

export const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  
  // Fetch employer's jobs
  const { data: jobsResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['/api/jobs'],
    enabled: !!user,
    queryFn: async () => {
      try {
        const response = await fetch('/api/jobs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          console.error('Error fetching employer jobs:', response.status, response.statusText);
          return { jobs: [], pagination: { total: 0, page: 1, pages: 1 } };
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching employer jobs:', error);
        return { jobs: [], pagination: { total: 0, page: 1, pages: 1 } };
      }
    }
  });
  
  // Extract and filter jobs
  const jobs = React.useMemo(() => {
    if (!jobsResponse?.jobs || !user) return [];
    
    // Filter jobs based on the user ID
    return jobsResponse.jobs.filter((job: Job) => {
      // Type guard to check if postedBy is an object with _id property
      const isPostedByObject = (postedBy: any): postedBy is { _id: string; name: string } => {
        return typeof postedBy === 'object' && postedBy !== null && '_id' in postedBy;
      };
      
      // Handle postedBy as an object with _id property
      const jobPostedById = isPostedByObject(job.postedBy)
        ? String(job.postedBy._id)
        : String(job.postedBy || '');
        
      const userId = String(user?.id || '');
      
      // Check for exact match
      return jobPostedById === userId;
    });
  }, [jobsResponse, user]);
  
  
  // Fetch recent applications
  const { data: applications = [], isLoading: isLoadingApplications } = useQuery<Application[]>({
    queryKey: ['/api/employer/applications'],
    enabled: !!user,
    queryFn: async () => {
      try {
        const response = await fetch('/api/employer/applications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching applications:', error);
        return [];
      }
    }
  });
  
  // Calculate stats from jobs and applications data
  const stats: Stats | null = React.useMemo(() => {
    if (!jobs || !applications) return null;
    
    // Calculate active jobs (jobs with no status or status === 'active')
    const activeJobs = jobs.filter((job: any) => !job.status || job.status === 'active' || job.status === 'Active').length;
    
    // Calculate interviews scheduled and positions filled
    const interviewsScheduled = applications.filter(app => app.status === 'interview').length;
    const positionsFilled = applications.filter(app => app.status === 'accepted').length;
    
    return {
      activeJobs,
      totalJobs: jobs.length,
      totalApplications: applications.length,
      interviewsScheduled,
      positionsFilled
    };
  }, [jobs, applications]);
  
  const isLoadingStats = isLoadingJobs;
  
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
            {/* Statistics Cards */}
            <Box width="100%">
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Active Jobs
                      </Typography>
                      <Typography variant="h5" component="div">
                        {isLoadingStats ? <CircularProgress size={20} /> : stats?.activeJobs || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Applications
                      </Typography>
                      <Typography variant="h5" component="div">
                        {isLoadingApplications ? <CircularProgress size={20} /> : stats?.totalApplications || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Interviews Scheduled
                      </Typography>
                      <Typography variant="h5" component="div">
                        {isLoadingApplications ? <CircularProgress size={20} /> : stats?.interviewsScheduled || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Positions Filled
                      </Typography>
                      <Typography variant="h5" component="div">
                        {isLoadingApplications ? <CircularProgress size={20} /> : stats?.positionsFilled || 0}
                      </Typography>
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
                      <Box component="div">
                        <Typography component="div">Loading jobs...</Typography>
                      </Box>
                    </ListItem>
                  ) : jobs && jobs.length > 0 ? (
                    jobs.slice(0, 5).map((job: any) => (
                      <ListItem key={job._id}>
                        <Box flex={1}>
                          <Typography component="div" variant="body1">
                            {job.title}
                          </Typography>
                          <Typography component="div" variant="body2" color="textSecondary">
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
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
                      <Box component="div">
                        <Typography component="div">No jobs posted yet</Typography>
                      </Box>
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
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Applications
              </Typography>
              {isLoadingApplications ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : applications && applications.length > 0 ? (
                <List>
                  {applications.slice(0, 5).map((application) => (
                    <ListItem
                      key={application._id}
                      divider
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                      }}
                    >
                      <Box flex={1}>
                        <Typography component="div" variant="subtitle1">
                          {application.userId.name}
                        </Typography>
                        <Typography component="div" variant="body2" color="textSecondary">
                          {application.userId.email}
                        </Typography>
                        <Typography component="div" variant="body2" color="textSecondary">
                          Applied for: {application.jobId.title}
                        </Typography>
                        {application.userId.location && (
                          <Typography component="div" variant="body2" color="textSecondary">
                            Location: {application.userId.location}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Chip
                          label={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          color={
                            application.status === 'pending' ? 'default' :
                            application.status === 'interview' ? 'primary' :
                            application.status === 'accepted' ? 'success' :
                            'error'
                          }
                          size="small"
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/applications/${application._id}`)}
                      >
                        View Details
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box py={3} textAlign="center">
                  <Typography component="div" color="textSecondary">
                    No applications yet
                  </Typography>
                </Box>
              )}
            </Paper>
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

