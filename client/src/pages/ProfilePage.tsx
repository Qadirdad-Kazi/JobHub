import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Chip,
  Divider,
  Stack,
  LinearProgress,
  Alert,
  IconButton,
  Grid as MuiGrid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { UserRole } from '@shared/schema';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { config } from '../config';

interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  location: string;
  skills: string[];
  currentSkill: string;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    bio: '',
    location: '',
    skills: [],
    currentSkill: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  interface UserProfile {
    name: string;
    email: string;
    bio: string | null;
    location: string | null;
    profileImage: string | null;
    skills: string[];
    experience: any[];
    education: any[];
    profileViews: number;
  }

  // Fetch user profile data with fallback to localStorage
  const { data: userProfile, isLoading, refetch } = useQuery<UserProfile>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        // Try to fetch from API first using environment-based configuration
        const apiBaseUrl = config.api.baseUrl.endsWith('/api') 
          ? config.api.baseUrl.replace(/\/api$/, '') 
          : config.api.baseUrl;
          
        console.log('Using API base URL from config:', apiBaseUrl);
        
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched user profile data from API:', data);
          // Store in localStorage for offline access
          localStorage.setItem('userData', JSON.stringify(data));
          return data;
        } else {
          console.warn('API request failed, falling back to localStorage');
          throw new Error('API request failed');
        }
      } catch (error) {
        // Fallback to localStorage if API fails
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('Using profile data from localStorage:', parsedData);
          return parsedData;
        }
        
        // If no stored data, create a placeholder profile
        return {
          // Construct name from firstName and lastName if available
          name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
          email: user?.email || '',
          bio: null,
          location: null,
          profileImage: null,
          skills: [],
          experience: [],
          education: [],
          profileViews: 0
        };
      }
    },
    enabled: true, // Always try to fetch
    retry: 1,
    staleTime: 60000, // 1 minute
  });
  
  // Set form data when profile is loaded
  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        skills: userProfile.skills || [],
        currentSkill: '',
      });
    }
  }, [userProfile]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!userProfile) return 0;
    
    const fieldsToCheck = [
      { field: 'name', value: userProfile.name },
      { field: 'email', value: userProfile.email },
      { field: 'bio', value: userProfile.bio },
      { field: 'location', value: userProfile.location },
      { field: 'skills', value: userProfile.skills?.length > 0 },
      { field: 'experience', value: userProfile.experience?.length > 0 },
      { field: 'education', value: userProfile.education?.length > 0 },
    ];
    
    const totalFields = fieldsToCheck.length;
    const completedFields = fieldsToCheck.filter(item => !!item.value).length;
    
    const percentage = Math.round((completedFields / totalFields) * 100);
    return percentage;
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      try {
        // Use environment-based configuration for API URL
        const apiBaseUrl = config.api.baseUrl.endsWith('/api') 
          ? config.api.baseUrl.replace(/\/api$/, '') 
          : config.api.baseUrl;
        
        console.log('Updating profile using API base URL:', apiBaseUrl);
        
        const response = await fetch(`${apiBaseUrl}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          const responseData = await response.json();
          
          // Store updated profile data in localStorage for offline access
          const updatedProfile = {
            ...userProfile,
            ...data,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('userData', JSON.stringify(updatedProfile));
          
          return responseData;
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update profile on server');
        }
      } catch (error) {
        console.warn('API update failed, saving profile to localStorage only');
        
        // Fallback: Update profile in localStorage only
        const updatedProfile = {
          ...userProfile,
          ...data,
          updatedAt: new Date().toISOString(),
          pendingSync: true // Mark as needing sync when connection is restored
        };
        
        localStorage.setItem('userData', JSON.stringify(updatedProfile));
        return { success: true, message: 'Profile updated locally', data: updatedProfile };
      }
    },
    onSuccess: (data) => {
      if (data.pendingSync) {
        setSuccess('Profile updated locally. Changes will be synced when connection is restored.');
      } else {
        setSuccess('Profile updated successfully');
      }
      setIsEditing(false);
      refetch(); // Refetch profile data after update
      setTimeout(() => setSuccess(null), 5000); // Clear success message after 5 seconds
    },
    onError: (error: Error) => {
      setError(error.message);
      setTimeout(() => setError(null), 5000); // Clear error message after 5 seconds
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (formData.currentSkill.trim() && !formData.skills.includes(formData.currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.currentSkill.trim()],
        currentSkill: ''
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove currentSkill from the data sent to the API
    const { currentSkill, ...dataToSubmit } = formData;
    
    updateProfileMutation.mutate(dataToSubmit as ProfileFormData);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <MuiGrid container spacing={3} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
          {/* Profile Overview */}
          <MuiGrid sx={{ gridColumn: { xs: '1', md: '1' } }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box textAlign="center" mb={3}>
                <Typography variant="h5" gutterBottom>
                  Profile Overview
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      mb: 2,
                      mx: 'auto',
                    }}
                  >
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : '?'}
                  </Box>
                </Box>
                <Typography variant="h6">{userProfile?.name || 'Not provided'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {userProfile?.email || 'Not provided'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Profile Completion
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={calculateProfileCompletion()}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" align="right" sx={{ mt: 1 }}>
                  {calculateProfileCompletion()}%
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Profile Views
                </Typography>
                <Typography variant="h4">{userProfile?.profileViews || 0}</Typography>
              </Box>
            </Paper>
          </MuiGrid>

          {/* Profile Information */}
          <MuiGrid sx={{ gridColumn: { xs: '1', md: '2' } }}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Profile Information</Typography>
                <Button 
                  variant="outlined" 
                  startIcon={isEditing ? null : <EditIcon />}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Box>

              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                    
                    <TextField
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      disabled
                    />
                    
                    <TextField
                      label="Bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                    
                    <TextField
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      fullWidth
                      placeholder="City, Country"
                    />
                    
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>Skills</Typography>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <TextField
                          label="Add Skill"
                          name="currentSkill"
                          value={formData.currentSkill}
                          onChange={handleInputChange}
                          fullWidth
                          placeholder="e.g. JavaScript, React, Project Management"
                        />
                        <Button 
                          variant="contained" 
                          onClick={handleAddSkill} 
                          sx={{ ml: 1 }}
                          disabled={!formData.currentSkill.trim()}
                        >
                          <AddIcon />
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formData.skills.map((skill, index) => (
                          <Chip 
                            key={index} 
                            label={skill} 
                            onDelete={() => handleRemoveSkill(skill)} 
                            color="primary" 
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Stack>
                </form>
              ) : (
                <MuiGrid container spacing={2}>
                  <MuiGrid sx={{ width: '100%' }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1">
                        {userProfile?.name || 'Not provided'}
                      </Typography>
                    </Box>
                  </MuiGrid>
                  
                  <MuiGrid sx={{ width: '100%' }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {userProfile?.email || 'Not provided'}
                      </Typography>
                    </Box>
                  </MuiGrid>
                  
                  <MuiGrid sx={{ width: '100%' }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        Role
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {user?.role || 'Not specified'}
                      </Typography>
                    </Box>
                  </MuiGrid>
                  
                  <MuiGrid sx={{ width: '100%' }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        Bio
                      </Typography>
                      <Typography variant="body1">
                        {userProfile?.bio || 'No bio provided'}
                      </Typography>
                    </Box>
                  </MuiGrid>
                  
                  <MuiGrid sx={{ width: '100%' }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {userProfile?.location || 'Not specified'}
                      </Typography>
                    </Box>
                  </MuiGrid>
                  
                  <MuiGrid sx={{ width: '100%' }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {userProfile?.skills && userProfile.skills.length > 0 ? (
                          userProfile.skills.map((skill, index) => (
                            <Chip key={index} label={skill} color="primary" variant="outlined" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No skills added
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </MuiGrid>
                </MuiGrid>
              )}
            </Paper>
          </MuiGrid>
        </MuiGrid>

        {user?.role === UserRole.JOBSEEKER && (
          <>
            {/* Experience Section */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Experience
                <IconButton 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }}
                  onClick={() => navigate('/experience/add')}
                >
                  <AddIcon />
                </IconButton>
              </Typography>
              
              {userProfile?.experience && userProfile.experience.length > 0 ? (
                userProfile.experience.map((exp: any, index: number) => (
                  <Box key={index} sx={{ mb: 2, position: 'relative' }}>
                    <IconButton 
                      size="small" 
                      sx={{ position: 'absolute', right: 0, top: 0 }}
                      onClick={() => navigate(`/experience/edit/${index}`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="subtitle1">{exp.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {exp.company} • {exp.startDate} - {exp.endDate || 'Present'}
                    </Typography>
                    <Typography variant="body2">{exp.description}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No experience added yet.
                </Typography>
              )}
            </Box>

            {/* Education Section */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Education
                <IconButton 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }}
                  onClick={() => navigate('/education/add')}
                >
                  <AddIcon />
                </IconButton>
              </Typography>
              
              {userProfile?.education && userProfile.education.length > 0 ? (
                userProfile.education.map((edu: any, index: number) => (
                  <Box key={index} sx={{ mb: 2, position: 'relative' }}>
                    <IconButton 
                      size="small" 
                      sx={{ position: 'absolute', right: 0, top: 0 }}
                      onClick={() => navigate(`/education/edit/${index}`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="subtitle1">{edu.degree}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {edu.institution} • {edu.startDate} - {edu.endDate || 'Present'}
                    </Typography>
                    <Typography variant="body2">{edu.description}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No education added yet.
                </Typography>
              )}
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default ProfilePage;
