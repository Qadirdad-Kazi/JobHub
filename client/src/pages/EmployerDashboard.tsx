import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Job, Application } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusColor, formatDate } from "@/lib/utils";
import JobCard from "@/components/JobCard";
import ApplicationCard from "@/components/ApplicationCard";
import { PlusCircle, Briefcase, UserCheck, ChevronRight } from "lucide-react";

export default function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState("posted-jobs");
  
  // Fetch all jobs posted by the employer
  const { 
    data: jobs, 
    isLoading: isLoadingJobs,
    error: jobsError
  } = useQuery<Job[]>({
    queryKey: ['/api/employer/jobs'],
  });
  
  // Fetch all applications for employer's jobs
  const { 
    data: applications, 
    isLoading: isLoadingApplications,
    error: applicationsError 
  } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });
  
  // Group applications by status
  const applicationsByStatus = applications?.reduce((acc, app) => {
    const status = app.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(app);
    return acc;
  }, {} as Record<string, Application[]>) || {};
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <Link href="/post-job">
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle size={16} className="mr-2" />
              Post a New Job
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-md bg-blue-100 p-3 mr-4">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Posted Jobs</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {isLoadingJobs ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      jobs?.length || 0
                    )}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-md bg-green-100 p-3 mr-4">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Applications</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {isLoadingApplications ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      applications?.length || 0
                    )}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <p className="text-sm text-gray-500 mb-2">Application Status</p>
                {isLoadingApplications ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(applicationsByStatus).map(([status, apps]) => (
                      <div key={status} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Badge className={getStatusColor(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </div>
                        <span className="text-gray-700 font-medium">{apps.length}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-8">
            <TabsTrigger value="posted-jobs">Posted Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posted-jobs" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Your Posted Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingJobs ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-[260px] w-full" />
                    ))}
                  </div>
                ) : jobsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Failed to load jobs</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : jobs && jobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No jobs posted yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start attracting candidates by posting your first job.
                    </p>
                    <Link href="/post-job">
                      <Button className="bg-primary hover:bg-primary/90">
                        Post Your First Job
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="applications" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Received Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingApplications ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-[150px] w-full" />
                    ))}
                  </div>
                ) : applicationsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Failed to load applications</p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : applications && applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <ApplicationCard 
                        key={application.id} 
                        application={application} 
                        isEmployerView={true} 
                        jobs={jobs || []}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No applications yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      When candidates apply to your jobs, their applications will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
