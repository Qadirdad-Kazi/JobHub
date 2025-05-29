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
import { UserRole } from '@shared/schema';
import { Home } from './pages/Home';
import { JobsPage } from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import { PostJob } from './pages/PostJob';
import { JobSeekerDashboard } from './pages/JobSeekerDashboard';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { EmployerJobs } from './pages/EmployerJobs';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { ProfilePage } from './pages/ProfilePage';
import { MyApplications } from './pages/MyApplications';
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
                      <ProtectedRoute allowedRoles={[UserRole.JOBSEEKER]}>
                        <JobSeekerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resume-builder"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.JOBSEEKER]}>
                        <ResumeBuilder />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Protected Employer Routes */}
                  <Route
                    path="/employer/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                        <EmployerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/post-job"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                        <PostJob />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employer/post-job"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                        <PostJob />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employer/jobs"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                        <EmployerJobs />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Profile Page - Available for both jobseekers and employers */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.JOBSEEKER, UserRole.EMPLOYER]}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Applications Page - Available for job seekers */}
                  <Route
                    path="/applications"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.JOBSEEKER]}>
                        <MyApplications />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Alternative path for applications */}
                  <Route
                    path="/jobseeker/applications"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.JOBSEEKER]}>
                        <MyApplications />
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
