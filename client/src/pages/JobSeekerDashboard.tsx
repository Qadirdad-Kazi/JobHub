import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Application, Resume } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ApplicationCard from "@/components/ApplicationCard";
import ResumeCard from "@/components/ResumeCard";
import { getStatusColor, formatDate } from "@/lib/utils";
import { PlusCircle, FileText, ClipboardList, Search } from "lucide-react";

export default function JobSeekerDashboard() {
  const [activeTab, setActiveTab] = useState("applications");
  
  // Fetch all applications for the job seeker
  const { 
    data: applications, 
    isLoading: isLoadingApplications,
    error: applicationsError 
  } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });
  
  // Fetch all resumes for the job seeker
  const { 
    data: resumes, 
    isLoading: isLoadingResumes,
    error: resumesError 
  } = useQuery<Resume[]>({
    queryKey: ['/api/resumes'],
  });
  
  // Count applications by status
  const applicationStatusCounts = applications?.reduce((acc, app) => {
    const status = app.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Seeker Dashboard</h1>
          <div className="flex space-x-2">
            <Link href="/resume-builder">
              <Button variant="outline">
                <FileText size={16} className="mr-2" />
                Create Resume
              </Button>
            </Link>
            <Link href="/jobs">
              <Button className="bg-primary hover:bg-primary/90">
                <Search size={16} className="mr-2" />
                Find Jobs
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-md bg-blue-100 p-3 mr-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Your Resumes</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {isLoadingResumes ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      resumes?.length || 0
                    )}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-md bg-purple-100 p-3 mr-4">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
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
              <div className="flex flex-col">
                <p className="text-sm text-gray-500 mb-2">Application Status</p>
                {isLoadingApplications ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(applicationStatusCounts).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className={`h-2.5 w-2.5 rounded-full mr-2 ${getStatusColor(status)}`}></span>
                          <span className="text-sm">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        <span className="text-gray-700 font-medium">{count}</span>
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
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="resumes">Resumes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Your Applications</CardTitle>
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
                        isEmployerView={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No applications yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start applying to jobs to track your applications here.
                    </p>
                    <Link href="/jobs">
                      <Button className="bg-primary hover:bg-primary/90">
                        Browse Jobs
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resumes" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Resumes</CardTitle>
                <Link href="/resume-builder">
                  <Button size="sm">
                    <PlusCircle size={16} className="mr-2" />
                    New Resume
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoadingResumes ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-[200px] w-full" />
                    ))}
                  </div>
                ) : resumesError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Failed to load resumes</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : resumes && resumes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resumes.map((resume) => (
                      <ResumeCard key={resume.id} resume={resume} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No resumes yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Create your first resume to apply for jobs.
                    </p>
                    <Link href="/resume-builder">
                      <Button className="bg-primary hover:bg-primary/90">
                        Create Your First Resume
                      </Button>
                    </Link>
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
