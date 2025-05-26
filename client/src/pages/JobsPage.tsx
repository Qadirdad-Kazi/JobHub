import React, { useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Job } from '@shared/schema';
import JobSearchForm from '@/components/JobSearchForm';

export const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    q: '',
    location: '',
    type: ''
  });

  const { data: jobsData, isLoading } = useQuery<{ jobs: Job[], pagination: { total: number, page: number, pages: number } }>({
    queryKey: [`/api/jobs?${new URLSearchParams(searchParams).toString()}`],
  });

  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Available Jobs
        </Typography>

        <Box sx={{ mb: 4 }}>
          <JobSearchForm onSearch={handleSearch} />
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : jobsData?.jobs && jobsData.jobs.length > 0 ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Found {jobsData.pagination.total} jobs
            </Typography>
            <Grid container spacing={3}>
              {jobsData.jobs.map((job) => (
                <Grid item xs={12} key={job._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.company} • {job.type} • {job.location}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        {job.description.length > 200 
                          ? `${job.description.substring(0, 200)}...` 
                          : job.description}
                      </Typography>
                      {job.salary && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                        </Typography>
                      )}
                      <Button 
                        variant="contained" 
                        color="primary" 
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            No jobs found matching your criteria
          </Typography>
        )}
      </Box>
    </Container>
  );
};
