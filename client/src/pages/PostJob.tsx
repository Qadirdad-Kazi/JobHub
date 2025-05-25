import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getLocalUser } from "@/lib/utils";
import { JobForm } from "@/components/JobForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

export default function PostJob() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const user = getLocalUser();
  
  const postJobMutation = useMutation({
    mutationFn: (jobData: any) => {
      return apiRequest("POST", "/api/jobs", jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employer/jobs'] });
      toast({
        title: "Job Posted",
        description: "Your job has been posted successfully.",
      });
      navigate("/employer/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "There was an error posting your job.",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (formData: any) => {
    // For demo purposes, use a default employer ID if user is not logged in
    const employerId = user ? user.id : 1; // Use default ID 1 for demo
    
    // Add employer ID to the form data
    const jobData = {
      ...formData,
      employerId: employerId,
    };
    
    postJobMutation.mutate(jobData);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/employer/dashboard")}
            className="mb-6"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Post a New Job</CardTitle>
              <CardDescription>
                Fill out the form below to create a new job listing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobForm 
                onSubmit={handleSubmit} 
                isSubmitting={postJobMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
