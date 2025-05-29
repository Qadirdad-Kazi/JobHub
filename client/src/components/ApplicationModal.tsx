import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getLocalUser } from "@/lib/utils";
import { Resume as BaseResume } from "@shared/schema";
import { useNavigate } from "react-router-dom";

// Extended Resume interface to include id property for the component
interface ResumeWithId extends BaseResume {
  id: string;
  _id?: string;
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
}

const applicationSchema = z.object({
  resumeId: z.string().min(1, { message: "Please select a resume" }),
  coverLetter: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function ApplicationModal({
  isOpen,
  onClose,
  jobId,
}: ApplicationModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const user = getLocalUser();
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [allResumes, setAllResumes] = useState<ResumeWithId[]>([]);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      resumeId: "",
      coverLetter: "",
    },
  });

  // Fetch resumes from API
  const { data: apiResumes } = useQuery<any[]>({  // Using any[] temporarily to handle the API response
    queryKey: ["/api/resumes"],
    enabled: isOpen && !!user,
    retry: 2
  });

  // No longer using localStorage for resumes

  // No longer syncing localStorage resumes with database

  // Update resumes when API data changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingResumes(true);
      
      if (apiResumes && Array.isArray(apiResumes)) {
        // Use API resumes - map them to include id property
        console.log('Using API resumes:', apiResumes);
        const formattedResumes = apiResumes.map(resume => ({
          ...resume,
          id: resume._id || resume.id || ''
        }));
        setAllResumes(formattedResumes);
      } else {
        // No resumes found
        setAllResumes([]);
      }
      
      setIsLoadingResumes(false);
    }
  }, [isOpen, apiResumes, user]);
  
  // Use the API resumes for the form
  const resumes = allResumes;

  // Mutation to submit the application
  const applicationMutation = useMutation({
    mutationFn: (data: ApplicationFormValues) => {
      return apiRequest("POST", "/api/applications", {
        jobId,
        userId: user?.id,
        resumeId: data.resumeId, // Use the string ID directly for MongoDB ObjectId
        coverLetter: data.coverLetter,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setSubmitted(true);
      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Application failed",
        description: error instanceof Error ? error.message : "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isOpen) {
      // Reset form and state when modal closes
      form.reset();
      setSubmitted(false);
    }
  }, [isOpen, form]);

  const onSubmit = (data: ApplicationFormValues) => {
    applicationMutation.mutate(data);
  };

  const createNewResume = () => {
    onClose();
    window.location.href = "/resume-builder";
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Application Submitted</DialogTitle>
              <DialogDescription>
                Your application has been successfully submitted.
              </DialogDescription>
            </DialogHeader>
            <div className="my-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-green-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-700 mb-2">
                Thank you for applying! The employer will review your application.
              </p>
              <p className="text-gray-500 text-sm">
                You can track the status of your application in your dashboard.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={onClose}>Close</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  onClose();
                  window.location.href = "/jobseeker/dashboard";
                }}
              >
                View Application
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Apply for this Job</DialogTitle>
              <DialogDescription>
                Submit your resume and cover letter to apply for this position.
              </DialogDescription>
            </DialogHeader>
            
            {isLoadingResumes ? (
              <div className="py-4 text-center">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : resumes.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-amber-500">
                  You don't have any resumes yet. Please create a resume first.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => navigate("/resume-builder")}
                >
                  Create Resume
                </Button>
              </div>
            ) : resumes && resumes.length > 0 ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                  <FormField
                    control={form.control}
                    name="resumeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Resume</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a resume" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {resumes.map((resume) => (
                              <SelectItem key={resume.id} value={resume.id.toString()}>
                                {resume.title || `Resume for ${resume.content?.personalInfo?.name || 'Unknown'}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="coverLetter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Letter (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explain why you are a good fit for this position..."
                            className="resize-y min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="mr-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={applicationMutation.isPending}
                    >
                      {applicationMutation.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            ) : (
              <div className="py-6 text-center">
                <p className="mb-4">You don't have any resumes yet.</p>
                <Button onClick={createNewResume}>Create a Resume</Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
