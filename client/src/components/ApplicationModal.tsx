import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { getLocalUser } from "@/lib/utils";
import { Resume as BaseResume } from "@shared/schema";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// Extended Resume interface to include id property for the component
interface ResumeWithId {
  _id: string;
  userId: string;
  title?: string;
  content: {
    personalInfo: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      website?: string | null;
    };
    education: Array<{
      school?: string;
      degree?: string;
      fieldOfStudy?: string;
      startDate?: string;
      endDate?: string | null;
      description?: string;
    }>;
    experience: Array<{
      company?: string;
      position?: string;
      location?: string;
      startDate?: string;
      endDate?: string | null;
      description?: string;
    }>;
    skills: string[];
    projects?: Array<{
      name?: string;
      description?: string;
      technologies?: string[];
      link?: string | null;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

import {
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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

interface ApplicationResponse {
  _id: string;
  jobId: string;
  userId: string;
  resumeId: string;
  status: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  jobId,
}: ApplicationModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const user = getLocalUser();
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch resumes from API
  const { data: resumes, isLoading: isLoadingResumes } = useQuery<ResumeWithId[]>({
    queryKey: ["/api/resumes"],
    enabled: isOpen && !!user,
    retry: 2,
    select: (data) => data.map(resume => ({
      ...resume,
      id: resume._id || resume.id || ''
    }))
  });

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedResumeId("");
      setCoverLetter("");
      setSubmitted(false);
    }
  }, [isOpen]);

  // Create application mutation
  const { mutate: submitApplication, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!selectedResumeId) {
        throw new Error('Please select a resume');
      }
      
      const response = await api.post("/api/applications", {
        jobId,
        userId: user?.id,
        resumeId: selectedResumeId,
        coverLetter: coverLetter.trim() || undefined
      });
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setSubmitted(true);
      toast({
        title: "Success!",
        description: "Your application has been submitted successfully.",
      });
      onClose();
      setSelectedResumeId("");
      setCoverLetter("");
    },
    onError: (error: any) => {
      console.error('Application submission error:', error);
      
      // Handle different error cases
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('already applied')) {
          toast({
            title: "Already Applied",
            description: "You have already submitted an application for this job.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.response.data.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to submit application. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedResumeId) {
      toast({
        title: "Error",
        description: "Please select a resume to apply with.",
        variant: "destructive"
      });
      return;
    }
    
    submitApplication();
  };

  const createNewResume = () => {
    onClose();
    navigate("/resume-builder");
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Resume</label>
            {isLoadingResumes ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : resumes && resumes.length > 0 ? (
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a resume" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume._id} value={resume._id}>
                      {resume.title || `Resume ${new Date(resume.createdAt).toLocaleDateString()}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No resumes found.</p>
                <Button
                  type="button"
                  variant="link"
                  onClick={createNewResume}
                >
                  Create a Resume
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cover Letter (Optional)</label>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write a cover letter..."
              className="h-32"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedResumeId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
