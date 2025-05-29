import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@shared/schema";

// Extended Job interface to include tags that might be present in the API response
interface ExtendedJob extends Job {
  tags?: string[];
  id?: string; // Some places might use id instead of _id
}
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { formatSalary, formatDate, isAuthenticated, isJobSeeker } from "@/lib/utils";
import { CalendarIcon, MapPinIcon, BuildingIcon, BriefcaseIcon, DollarSignIcon } from "lucide-react";
import ApplicationModal from "@/components/ApplicationModal";

interface JobDetailPageProps {
  id: number;
}

export default function JobDetailPage({ id }: JobDetailPageProps) {
  const [, navigate] = useLocation();
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const { data: job, isLoading, error } = useQuery<ExtendedJob>({
    queryKey: [`/api/jobs/${id}`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/jobs/${id}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching job details: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching job details:', error);
        throw error;
      }
    }
  });

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleApplyClick = () => {
    if (isAuthenticated() && isJobSeeker()) {
      setShowApplicationModal(true);
    } else if (!isAuthenticated()) {
      // Trigger auth modal to open
      document.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'signIn' } }));
    } else {
      // User is authenticated but not a job seeker
      alert("Only job seekers can apply for jobs. Please sign in with a job seeker account.");
    }
  };

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-6">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/jobs">
              <Button>Browse All Jobs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex items-center mb-4">
                <Skeleton className="h-6 w-1/3" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
              <Skeleton className="h-8 w-40 mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ) : job ? (
          <>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => navigate('/jobs')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              Back to Jobs
            </Button>

            <Card>
              <CardContent className="p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <div className="flex items-center text-gray-600">
                      <BuildingIcon className="h-5 w-5 mr-2" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                  </div>
                  <Button 
                    className="bg-primary text-white hover:bg-primary/90" 
                    onClick={handleApplyClick}
                  >
                    Apply Now
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center text-gray-700">
                    <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <DollarSignIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{job.salary ? formatSalary(job.salary.min + '-' + job.salary.max + ' ' + job.salary.currency) : 'Not specified'}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Posted on {job.createdAt ? formatDate(job.createdAt) : 'Unknown date'}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {job.type}
                    </Badge>
                    {job.tags && Array.isArray(job.tags) && job.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                    <div className="prose max-w-none text-gray-700">
                      {job.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">{paragraph}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                    <div className="prose max-w-none text-gray-700">
                      {Array.isArray(job.requirements) ? job.requirements.map((requirement: string, index: number) => (
                        <p key={index} className="mb-4">{requirement}</p>
                      )) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button 
                    className="w-full md:w-auto bg-primary text-white hover:bg-primary/90" 
                    onClick={handleApplyClick}
                  >
                    Apply for this position
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Application Modal */}
            <ApplicationModal 
              isOpen={showApplicationModal} 
              onClose={() => setShowApplicationModal(false)} 
              jobId={job._id || ''}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
