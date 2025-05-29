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
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  AlertTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../context/AuthContext';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  postedBy: string | {
    _id: string;
    name: string;
  };
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  createdAt: string;
  updatedAt: string;
  status?: string;
  type?: string;
}

interface EditJobForm {
  title: string;
  location: string;
  description: string;
  status: string;
}

export const EmployerJobs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditJobForm>({
    title: '',
    location: '',
    description: '',
    status: 'active'
  });
  
  // Fetch employer's jobs
  const { data: jobs = [], isLoading, error, refetch } = useQuery<Job[]>({
    queryKey: ['/api/jobs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      try {
        const response = await fetch('/api/jobs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error fetching employer jobs:', response.status, response.statusText, errorText);
          throw new Error(response.statusText || 'Failed to fetch jobs');
        }
        
        const data = await response.json();
        // Extract jobs array from response (handle both array and paginated object formats)
        const jobsArray = data.jobs ? data.jobs : (Array.isArray(data) ? data : []);
        
        // Filter jobs based on the user ID
        if (jobsArray.length > 0) {
          // Filter jobs that match the current user's ID
          const filteredJobs = jobsArray.filter((job: Job) => {
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
          
          // Jobs filtered successfully
          
          // If no jobs match after filtering, show all for now (for debugging)
          return filteredJobs.length > 0 ? filteredJobs : jobsArray;
        }
        
        // If no jobs found or data is not an array, return empty array
        return [];
      } catch (error) {
        console.error('Error fetching employer jobs:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error deleting job:', response.status, response.statusText, errorText);
          throw new Error(response.statusText || 'Failed to delete job');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error deleting job:', error);
        throw error;
      }
    },
    onSuccess: () => {
      refetch();
      setIsDeleteDialogOpen(false);
      setSelectedJob(null);
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      // You could set an error state here to display to the user
    }
  });

  // No claim job functionality needed

  const updateMutation = useMutation({
    mutationFn: async (data: { jobId: string, updates: Partial<Job> }) => {
      try {
        // Validate required fields
        if (!data.updates.title || !data.updates.location || !data.updates.description) {
          throw new Error('Title, location, and description are required');
        }

        const response = await fetch(`/api/jobs/${data.jobId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data.updates)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error updating job:', response.status, response.statusText, errorText);
          throw new Error(response.statusText || 'Failed to update job');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error updating job:', error);
        throw error;
      }
    },
    onSuccess: () => {
      refetch();
      setIsEditDialogOpen(false);
      setSelectedJob(null);
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      // You could set an error state here to display to the user
    }
  });

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setEditForm({
      title: job.title,
      location: job.location,
      description: job.description,
      status: job.status || 'active'
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedJob) {
      deleteMutation.mutate(selectedJob._id);
    }
  };

  const handleSaveEdit = () => {
    if (selectedJob) {
      updateMutation.mutate({
        jobId: selectedJob._id,
        updates: editForm
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatSalary = (salary?: { min?: number; max?: number; currency?: string }) => {
    if (!salary) return 'Not specified';
    
    const currency = salary.currency || '$';
    
    if (salary.min !== undefined && salary.max !== undefined && salary.min !== salary.max) {
      return `${currency}${salary.min.toLocaleString()} - ${currency}${salary.max.toLocaleString()}`;
    } else if (salary.min !== undefined) {
      return `${currency}${salary.min.toLocaleString()}`;
    } else {
      return 'Not specified';
    }
  };

  const getStatusChipColor = (status?: string): "success" | "warning" | "error" | "default" => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'closed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mr: 2 }}>
            Manage Job Postings
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            size="small"
            sx={{ height: 'fit-content', mr: 1 }}
          >
            Refresh
          </Button>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/employer/post-job')}
        >
          Post New Job
        </Button>
      </Box>
      
      {/* Debug section removed */}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error</AlertTitle>
              Failed to load job postings
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {error instanceof Error ? error.message : 'Please try again later'}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => refetch()}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          </Box>
        ) : jobs.length > 0 ? (
          <List>
            {jobs.map((job) => (
              <ListItem 
                key={job._id} 
                alignItems="flex-start"
                sx={{ 
                  mb: 2, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1,
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" component="div">
                        {job.title}
                      </Typography>
                      <Chip 
                        label={job.status || 'Active'} 
                        color={getStatusChipColor(job.status)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Stack spacing={1} mt={1}>
                      <Typography variant="body2" component="div">
                        {job.location} • {formatSalary(job.salary)}
                      </Typography>
                      <Typography variant="body2" component="div" color="text.secondary">
                        Posted: {formatDate(job.createdAt)}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(job)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(job)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No job postings found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first job posting to start receiving applications
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/employer/post-job')}
            >
              Post a Job
            </Button>
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the job posting "{selectedJob?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            color="error" 
            onClick={confirmDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Job</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              name="title"
              label="Job Title"
              value={editForm.title}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              name="location"
              label="Location"
              value={editForm.location}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              name="description"
              label="Description"
              multiline
              rows={4}
              value={editForm.description}
              onChange={handleInputChange}
            />
            <TextField
              select
              fullWidth
              name="status"
              label="Status"
              value={editForm.status}
              onChange={handleInputChange}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button 
            color="primary" 
            onClick={handleSaveEdit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployerJobs;
