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

interface DashboardStats {
  activeJobs: number;
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
  const { data: jobs, isLoading: isLoadingJobs } = useQuery<Job[]>({
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
          return [];
        }
        const data = await response.json();
        // Filter jobs posted by the current user
        return Array.isArray(data) ? data.filter((job: Job) => job.postedBy === user?.id) : [];
      } catch (error) {
        console.error('Error fetching employer jobs:', error);
        return [];
      }
    }
  });
  
  
  // Fetch recent applications
  const { data: applications, isLoading: isLoadingApplications } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
    enabled: !!user,
    queryFn: async () => {
      try {
        const response = await fetch('/api/applications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          console.error('Error fetching applications:', response.statusText);
          return [];
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching applications:', error);
        return [];
      }
    }
  });
  
  // Fetch employer analytics
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['/api/analytics'],
    enabled: !!user,
    queryFn: async () => {
      try {
        const response = await fetch('/api/analytics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          console.error('Error fetching stats:', response.statusText);
          // Return empty stats
          return {
            activeJobs: jobs?.length || 0,
            totalApplications: applications?.length || 0,
            interviewsScheduled: 0,
            positionsFilled: 0
          };
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Return empty stats
        return {
          activeJobs: jobs?.length || 0,
          totalApplications: applications?.length || 0,
          interviewsScheduled: 0,
          positionsFilled: 0
        };
      }
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
                        <Typography variant="h4">{stats?.activeJobs !== undefined ? stats.activeJobs : (jobs && jobs.length > 0 ? jobs.filter(job => job.status !== 'closed').length : 0)}</Typography>
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
                        <Typography variant="h4">{stats?.totalApplications !== undefined ? stats.totalApplications : (applications?.length || 'Not Available')}</Typography>
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
                        <Typography variant="h4">{stats?.interviewsScheduled !== undefined ? stats.interviewsScheduled : 'Not Available'}</Typography>
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
                        <Typography variant="h4">{stats?.positionsFilled !== undefined ? stats.positionsFilled : 'Not Available'}</Typography>
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
