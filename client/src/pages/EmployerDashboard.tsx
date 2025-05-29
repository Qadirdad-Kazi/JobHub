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
  jobId: string;
  userId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
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
  const { data: applications, isLoading: isLoadingApplications } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
    enabled: false, // Disable this query until the endpoint is implemented
    queryFn: async () => {
      try {
        // This endpoint doesn't exist yet, so we'll return mock data
        return [];
      } catch (error) {
        console.error('Error fetching applications:', error);
        return [];
      }
    }
  });
  
  // Calculate stats from jobs data
  const stats: Stats | null = React.useMemo(() => {
    if (!jobs) return null;
    
    // Calculate active jobs (jobs with no status or status === 'active')
    const activeJobs = jobs.filter((job: any) => !job.status || job.status === 'active' || job.status === 'Active').length;
    
    return {
      activeJobs,
      totalJobs: jobs.length,
      totalApplications: 0, // We don't have applications data yet
      interviewsScheduled: 0,
      positionsFilled: 0
    };
  }, [jobs]);
  
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
            {/* Statistics Cards with real data from the backend */}
            <Box width="100%">
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Active Jobs
                      </Typography>
                      {isLoadingStats ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Typography variant="h4">{stats?.activeJobs !== undefined ? stats.activeJobs : (jobs && jobs.length > 0 ? jobs.filter((job: any) => !job.status || job.status === 'active' || job.status === 'Active').length : 0)}</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
                <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Applications
                      </Typography>
                      {isLoadingStats ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Typography variant="h4">{stats?.totalApplications !== undefined ? stats.totalApplications : (applications && applications.length > 0 ? applications.length : 0)}</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
                <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Interviews Scheduled
                      </Typography>
                      {isLoadingStats ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Typography variant="h4">{stats?.interviewsScheduled !== undefined ? stats.interviewsScheduled : 0}</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
                <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Positions Filled
                      </Typography>
                      {isLoadingStats ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Typography variant="h4">{stats?.positionsFilled !== undefined ? stats.positionsFilled : 0}</Typography>
                      )}
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
                  {isLoadingApplications ? (
                    <ListItem>
                      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', py: 2 }}>
                        <CircularProgress />
                      </Box>
                    </ListItem>
                  ) : applications && applications.length > 0 ? (
                    applications.slice(0, 5).map((application) => {
                      // Format the date
                      const applicationDate = new Date(application.createdAt);
                      const daysAgo = Math.floor((Date.now() - applicationDate.getTime()) / (1000 * 60 * 60 * 24));
                      const timeAgo = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
                      
                      // Get applicant name
                      const applicantName = application.user ? 
                        `${application.user.firstName} ${application.user.lastName}` : 
                        'Unknown Applicant';
                      
                      // Get job title
                      const jobTitle = application.job?.title || 'Unknown Position';
                      
                      return (
                        <ListItem key={application._id}>
                          <ListItemText 
                            primary={`${applicantName} - ${jobTitle}`}
                            secondary={`Applied ${timeAgo}`}
                          />
                          <Chip 
                            label={application.status.charAt(0).toUpperCase() + application.status.slice(1)} 
                            color={
                              application.status === 'new' ? 'info' : 
                              application.status === 'reviewed' ? 'primary' : 
                              application.status === 'interview' ? 'warning' : 
                              'default'
                            } 
                            size="small" 
                          />
                        </ListItem>
                      );
                    })
                  ) : (
                    <ListItem>
                      <ListItemText primary="No applications received yet. Applications will appear here when job seekers apply to your jobs." />
                    </ListItem>
                  )}
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
