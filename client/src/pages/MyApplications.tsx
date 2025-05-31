import React, { useEffect, useState } from 'react';
import { Application, ApplicationStatus, Job as JobType } from '@shared/schema';
import { applicationService } from '../services/applicationService';
import { ApplicationStatus as ApplicationStatusComponent } from '../components/ApplicationStatus';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid as MuiGrid,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// Create a custom Grid component that accepts the 'item' prop
const Grid = MuiGrid as React.ComponentType<any>;

// Define a type for populated application with job data
type PopulatedApplication = Omit<Application, 'jobId'> & {
  jobId: JobType | null;
};

interface EditDialogData {
  coverLetter?: string;
  notes?: string;
}

export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<PopulatedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<PopulatedApplication | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<EditDialogData>({
    coverLetter: '',
    notes: ''
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await applicationService.getMyApplications();
      // Type assertion since we know the server populates the job data
      setApplications(data as unknown as PopulatedApplication[]);
      setError(null);
    } catch (err) {
      setError('Failed to load applications. Please try again.');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationUpdate = (updatedApplication: Application) => {
    setApplications(apps =>
      apps.map(app =>
        app._id === updatedApplication._id 
          ? { 
              ...updatedApplication, 
              // Preserve the populated job data
              jobId: app.jobId 
            } as PopulatedApplication 
          : app
      )
    );
  };

  // Delete handlers
  const handleDeleteClick = (application: PopulatedApplication) => {
    setSelectedApplication(application);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedApplication) return;

    try {
      await applicationService.deleteApplication(selectedApplication._id);
      setApplications(apps => apps.filter(app => app._id !== selectedApplication._id));
      setDeleteDialogOpen(false);
      setSelectedApplication(null);
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Failed to delete application. Please try again.');
    }
  };

  // Edit handlers
  const handleEditClick = (application: PopulatedApplication) => {
    setSelectedApplication(application);
    setEditData({
      coverLetter: application.coverLetter || '',
      notes: application.notes || ''
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedApplication) return;

    try {
      const updatedApplication = await applicationService.updateApplication(
        selectedApplication._id,
        {
          coverLetter: editData.coverLetter,
          notes: editData.notes
        }
      );

      // Update the applications list with the edited application
      setApplications(apps =>
        apps.map(app =>
          app._id === selectedApplication._id
            ? { ...updatedApplication, jobId: selectedApplication.jobId } as PopulatedApplication
            : app
        )
      );
      
      setEditDialogOpen(false);
      setSelectedApplication(null);
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application. Please try again.');
    }
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
            // Skip rendering if job no longer exists
            if (!application.jobId) {
              return null;
            }

            return (
              <Grid item xs={12} key={application._id}>
                <Paper sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Typography variant="h6">{application.jobId.title}</Typography>
                      <Typography variant="body1" color="text.secondary">
                        {application.jobId.company}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Applied {formatDistanceToNow(new Date(application.appliedAt))} ago
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ApplicationStatusComponent
                        application={{
                          ...application,
                          jobId: application.jobId?._id || ''
                        } as Application}
                        onUpdate={handleApplicationUpdate}
                      />
                      <Tooltip title="Edit Application">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(application)}
                          disabled={application.status === ApplicationStatus.WITHDRAWN}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Application">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(application)}
                          disabled={application.status === ApplicationStatus.HIRED}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {application.status === ApplicationStatus.WITHDRAWN && application.withdrawalReason && (
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

                  {application.coverLetter && (
                    <Box mt={2}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Cover Letter: {application.coverLetter}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this application? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Application Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Application</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Cover Letter"
              multiline
              rows={4}
              fullWidth
              value={editData.coverLetter}
              onChange={(e) => setEditData(prev => ({ ...prev, coverLetter: e.target.value }))}
            />
            <TextField
              label="Notes"
              multiline
              rows={2}
              fullWidth
              value={editData.notes}
              onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}; 