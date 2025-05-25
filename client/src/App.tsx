import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import JobsPage from "@/pages/JobsPage";
import JobDetailPage from "@/pages/JobDetailPage";
import ResumeBuilder from "@/pages/ResumeBuilder";
import EmployerDashboard from "@/pages/EmployerDashboard";
import JobSeekerDashboard from "@/pages/JobSeekerDashboard";
import PostJob from "@/pages/PostJob";
import ForEmployers from "@/pages/ForEmployers";
import NotFound from "@/pages/not-found";
import { isAuthenticated, isEmployer, isJobSeeker } from "@/lib/utils";

// Protected route component
const ProtectedRoute = ({ 
  component: Component, 
  requiredRole, 
  ...rest 
}: { 
  component: React.ComponentType<any>; 
  requiredRole?: "employer" | "jobseeker"; 
  path: string;
}) => {
  if (!isAuthenticated()) {
    return <NotFound />;
  }

  if (requiredRole === "employer" && !isEmployer()) {
    return <NotFound />;
  }

  if (requiredRole === "jobseeker" && !isJobSeeker()) {
    return <NotFound />;
  }

  return <Component {...rest} />;
};

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/jobs" component={JobsPage} />
          <Route path="/jobs/:id">
            {params => <JobDetailPage id={parseInt(params.id)} />}
          </Route>
          <Route path="/for-employers" component={ForEmployers} />
          
          <Route path="/resume-builder">
            <ProtectedRoute path="/resume-builder" component={ResumeBuilder} requiredRole="jobseeker" />
          </Route>
          <Route path="/employer/dashboard">
            <ProtectedRoute path="/employer/dashboard" component={EmployerDashboard} requiredRole="employer" />
          </Route>
          <Route path="/jobseeker/dashboard">
            <ProtectedRoute path="/jobseeker/dashboard" component={JobSeekerDashboard} requiredRole="jobseeker" />
          </Route>
          <Route path="/post-job">
            <ProtectedRoute path="/post-job" component={PostJob} requiredRole="employer" />
          </Route>
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
