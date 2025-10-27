import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { JobAnalytics as JobAnalyticsType } from '@shared/schema';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../lib/api';

interface JobAnalyticsProps {
  jobId: string;
}

// Define colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Custom label for pie chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const JobAnalytics: React.FC<JobAnalyticsProps> = ({ jobId }) => {
  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ['jobAnalytics', jobId],
    queryFn: async () => {
      const response = await api.get(`/api/analytics/jobs/${jobId}`);
      return response.data;
    },
    enabled: !!jobId,
  });

  const analytics = analyticsResponse?.data as JobAnalyticsType;

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
        Analytics for: {analytics.title}
      </Typography>

      <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 4 }}>
        <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Views
              </Typography>
              <Typography variant="h4">{analytics.viewCount}</Typography>
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
        <Box width={{ xs: '100%', sm: '50%', md: '25%' }} px={1}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Time to Apply
              </Typography>
              <Typography variant="h4">{analytics.averageTimeToHire} days</Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>

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
              Application Status Breakdown
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.statusBreakdown).map(([name, value]) => ({
                      name: name.charAt(0).toUpperCase() + name.slice(1),
                      value,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(analytics.statusBreakdown).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default JobAnalytics;
