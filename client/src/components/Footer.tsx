import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              CareerConnectPro
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connecting talent with opportunity
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/jobs" color="text.secondary" display="block">
              Find Jobs
            </Link>
            <Link href="/for-employers" color="text.secondary" display="block">
              For Employers
            </Link>
            <Link href="/about" color="text.secondary" display="block">
              About Us
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: support@careerconnectpro.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: (555) 123-4567
            </Typography>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} CareerConnectPro. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
