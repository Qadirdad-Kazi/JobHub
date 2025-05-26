import React, { useEffect, useState } from 'react';
import { Application } from '@shared/schema';
import { applicationService } from '../services/applicationService';
import { ApplicationStatus } from '../components/ApplicationStatus';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationUpdate = (updatedApplication: Application) => {
    setApplications(apps =>
      apps.map(app =>
        app._id === updatedApplication._id ? updatedApplication : app
      )
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Applications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            You haven't applied to any jobs yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {applications.map((application) => {
            const job = application.jobId as any;
            return (
              <Grid item xs={12} key={application._id}>
                <Paper sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">{job.title}</Typography>
                      <Typography variant="body1" color="text.secondary">
                        {job.company}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Applied {formatDistanceToNow(new Date(application.appliedAt))} ago
                      </Typography>
                    </Box>
                    <ApplicationStatus
                      application={application}
                      onUpdate={handleApplicationUpdate}
                    />
                  </Box>

                  {application.status === 'withdrawn' && application.withdrawalReason && (
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">
                        Withdrawal reason: {application.withdrawalReason}
                      </Typography>
                    </Box>
                  )}

                  {application.notes && (
                    <Box mt={2}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Notes: {application.notes}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}; 