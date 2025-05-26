import React, { useState } from 'react';
import { Application, UserRole } from '@shared/schema';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../hooks/useAuth';
import {
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Alert,
} from '@mui/material';

interface ApplicationStatusProps {
  application: Application;
  onUpdate?: (updatedApplication: Application) => void;
}

const statusColors = {
  pending: 'warning',
  reviewed: 'info',
  accepted: 'success',
  rejected: 'error',
  withdrawn: 'default',
} as const;

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({
  application,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [status, setStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.notes || '');
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async () => {
    try {
      const updatedApplication = await applicationService.updateApplicationStatus(
        application._id,
        { status, notes }
      );
      onUpdate?.(updatedApplication);
      setIsUpdateDialogOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to update application status. Please try again.');
    }
  };

  const handleWithdraw = async () => {
    try {
      const updatedApplication = await applicationService.withdrawApplication(
        application._id,
        { reason: withdrawalReason }
      );
      onUpdate?.(updatedApplication);
      setIsWithdrawDialogOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to withdraw application. Please try again.');
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2}>
        <Badge color={statusColors[application.status]} variant="dot">
          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
            {application.status}
          </Typography>
        </Badge>

        {user?.role === UserRole.EMPLOYER && application.status !== 'withdrawn' && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setIsUpdateDialogOpen(true)}
          >
            Update Status
          </Button>
        )}

        {user?.role === UserRole.JOBSEEKER && application.status !== 'withdrawn' && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setIsWithdrawDialogOpen(true)}
          >
            Withdraw
          </Button>
        )}
      </Box>

      {/* Status Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onClose={() => setIsUpdateDialogOpen(false)}>
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as Application['status'])}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="reviewed">Reviewed</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="normal"
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawDialogOpen} onClose={() => setIsWithdrawDialogOpen(false)}>
        <DialogTitle>Withdraw Application</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to withdraw your application? This action cannot be undone.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="normal"
            label="Reason (Optional)"
            value={withdrawalReason}
            onChange={(e) => setWithdrawalReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsWithdrawDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleWithdraw} variant="contained" color="error">
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 