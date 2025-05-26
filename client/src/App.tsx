import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import { theme } from './lib/theme';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { JobsPage } from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import { PostJob } from './pages/PostJob';
import { JobSeekerDashboard } from './pages/JobSeekerDashboard';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// App Component
export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/jobs/:id" element={<JobDetailPage />} />
                  
                  {/* Protected Job Seeker Routes */}
                  <Route
                    path="/jobseeker/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['jobseeker']}>
                        <JobSeekerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resume-builder"
                    element={
                      <ProtectedRoute allowedRoles={['jobseeker']}>
                        <ResumeBuilder />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Protected Employer Routes */}
                  <Route
                    path="/employer/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <EmployerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/post-job"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <PostJob />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
