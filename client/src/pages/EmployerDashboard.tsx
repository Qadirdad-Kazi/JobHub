import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();

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
        
        <Grid container spacing={4}>
          {/* Statistics Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Active Jobs
                    </Typography>
                    <Typography variant="h4">12</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Applications
                    </Typography>
                    <Typography variant="h4">48</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Interviews Scheduled
                    </Typography>
                    <Typography variant="h4">8</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Positions Filled
                    </Typography>
                    <Typography variant="h4">3</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Active Jobs */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Active Job Listings
              </Typography>
              <List>
                {[1, 2, 3].map((job) => (
                  <ListItem
                    key={job}
                    sx={{ mb: 2, border: 1, borderColor: 'grey.200', borderRadius: 1 }}
                  >
                    <ListItemText
                      primary="Senior Software Engineer"
                      secondary="Posted on Jan 15, 2024 • 12 applications"
                    />
                    <Box>
                      <Chip label="Active" color="success" sx={{ mr: 1 }} />
                      <Button size="small" variant="outlined">
                        View Details
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          {/* Recent Applications */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Applications
              </Typography>
              <List>
                {[1, 2, 3].map((application) => (
                  <ListItem
                    key={application}
                    sx={{ mb: 2, border: 1, borderColor: 'grey.200', borderRadius: 1 }}
                  >
                    <ListItemText
                      primary="John Doe"
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            Software Engineer
                          </Typography>
                          {" — Applied 2 days ago"}
                        </React.Fragment>
                      }
                    />
                    <Button size="small">Review</Button>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
