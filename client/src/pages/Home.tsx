import React from 'react';
import { Container, Typography, Button, Box, CircularProgress, Paper } from '@mui/material';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import JobSearchForm from "@/components/JobSearchForm";
import JobCard from "@/components/JobCard";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@shared/schema";
import { isAuthenticated, isEmployer } from "@/lib/utils";

// Import MUI icons
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Fetch featured jobs
  const { data: featuredJobs, isLoading: isLoadingFeaturedJobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs?limit=3&featured=true');
      if (!response.ok) {
        throw new Error('Failed to fetch featured jobs');
      }
      return response.json();
    }
  });

  // Fetch job statistics
  const { data: jobStats, isLoading: isLoadingStats } = useQuery<{
    totalJobs: number;
    totalCompanies: number;
    totalJobSeekers: number;
  }>({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          return await response.json();
        }
        return { totalJobs: 5000, totalCompanies: 1000, totalJobSeekers: 10000 };
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to default values if API fails
        return { totalJobs: 5000, totalCompanies: 1000, totalJobSeekers: 10000 };
      }
    }
  });
  
  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 6' } }}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Find Your Dream Job Today
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4, opacity: 0.9 }}>
                Connect with top employers and discover opportunities that match your skills and aspirations.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/jobs')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Search Jobs
                </Button>
                {!isAuthenticated() && (
                  <>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{ px: 4, py: 1.5 }}
                    >
                      Sign Up
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      onClick={() => navigate('/register?role=employer')}
                      sx={{ px: 4, py: 1.5 }}
                    >
                      Post Job
                    </Button>
                  </>
                )}
                {isAuthenticated() && isEmployer() && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    onClick={() => navigate('/employer/post-job')}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Post a Job
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 6' } }}>
              <Box sx={{ position: 'relative', height: '100%', minHeight: 400 }}>
                <img
                  src="/hero-image.svg"
                  alt="Career opportunities"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    position: 'absolute',
                    top: 0,
                    right: 0
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Search Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
            Find the Perfect Job
          </Typography>
          <JobSearchForm />
        </Paper>

        {/* Stats Section */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={4}>
            <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 4' } }}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <WorkIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {isLoadingStats ? (
                    <CircularProgress size={24} />
                  ) : (
                    `${jobStats?.totalJobs?.toLocaleString() || '5000'}+`
                  )}
                </Typography>
                <Typography variant="subtitle1">Active Jobs</Typography>
              </Paper>
            </Grid>
            <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 4' } }}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {isLoadingStats ? (
                    <CircularProgress size={24} />
                  ) : (
                    `${jobStats?.totalCompanies?.toLocaleString() || '1000'}+`
                  )}
                </Typography>
                <Typography variant="subtitle1">Companies</Typography>
              </Paper>
            </Grid>
            <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 4' } }}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {isLoadingStats ? (
                    <CircularProgress size={24} />
                  ) : (
                    `${jobStats?.totalJobSeekers?.toLocaleString() || '10000'}+`
                  )}
                </Typography>
                <Typography variant="subtitle1">Job Seekers</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Featured Jobs Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
            Featured Jobs
          </Typography>
          {isLoadingFeaturedJobs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : featuredJobs && featuredJobs.length > 0 ? (
            <Grid container spacing={3}>
              {featuredJobs.map((job) => (
                <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 600px)': { gridColumn: 'span 6' }, '@media (min-width: 900px)': { gridColumn: 'span 4' } }} key={job._id}>
                  <JobCard job={job} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              No featured jobs available at the moment
            </Typography>
          )}
        </Box>

        {/* How It Works Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
            How It Works
          </Typography>
          <Grid container spacing={4}>
            <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 4' } }}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>1. Create Account</Typography>
                <Typography>
                  Sign up as a job seeker or employer and complete your profile.
                </Typography>
              </Paper>
            </Grid>
            <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 4' } }}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>2. Search Jobs</Typography>
                <Typography>
                  Browse through thousands of jobs or post your job opening.
                </Typography>
              </Paper>
            </Grid>
            <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 4' } }}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>3. Apply or Hire</Typography>
                <Typography>
                  Apply to jobs or find the perfect candidate for your position.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default Home;
