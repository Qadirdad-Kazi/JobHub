import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { EmployerAnalytics as EmployerAnalyticsType } from '@shared/schema';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const EmployerAnalytics: React.FC = () => {
  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ['employerAnalytics'],
    // Disable the query to prevent 401 errors
    enabled: false,
    queryFn: async () => {
      try {
        const response = await fetch('/api/analytics/employer', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch employer analytics');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching employer analytics:', error);
        throw error;
      }
    },
  });

  const analytics = analyticsResponse?.data as EmployerAnalyticsType;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Failed to load analytics data</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard Analytics
      </Typography>

      <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 4 }}>
        <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Jobs
              </Typography>
              <Typography variant="h4">{analytics.totalJobs}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Jobs
              </Typography>
              <Typography variant="h4">{analytics.activeJobs}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Applications
              </Typography>
              <Typography variant="h4">{analytics.totalApplications}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h4">{analytics.conversionRate.toFixed(2)}%</Typography>
              <Typography variant="caption">Applications / Views</Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      <Stack spacing={4}>
        <Stack direction="row" spacing={4} flexWrap="wrap">
          <Box width={{ xs: '100%', md: '50%' }} px={1}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Application Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics.applicationTrend}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Applications"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>
          <Box width={{ xs: '100%', md: '50%' }} px={1}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Job Posting Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.jobPostingTrend}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Jobs Posted" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>
        </Stack>
        <Box width="100%" px={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Status Breakdown
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', mt: 2 }}>
              {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                <Box key={status} sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4">{count}</Typography>
                  <Typography color="text.secondary">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default EmployerAnalytics;
