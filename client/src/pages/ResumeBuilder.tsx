import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ResumeForms } from "@/components/ResumeForms";
import { ResumePreview } from "@/components/ResumePreview";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { generateResumePDF, ResumeData } from "@/lib/pdf";
import { useToast } from "@/hooks/use-toast";
import { InsertResume, Resume } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { getLocalUser } from "@/lib/utils";
import { ChevronLeft, FileText, Eye, Save, Download } from "lucide-react";

export default function ResumeBuilder() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/resume-builder/:id");
  const [activeTab, setActiveTab] = useState("edit");
  const [resumeData, setResumeData] = useState<ResumeData>({
    title: "My Resume",
    contact: {
      name: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      website: ""
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    template: "modern"
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Get current user
  const user = getLocalUser();
  
  // Parse template from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const template = searchParams.get("template");
    if (template) {
      setResumeData(prev => ({
        ...prev,
        template: template
      }));
    }
  }, []);
  
  // If ID is provided, fetch the resume
  const resumeId = match ? parseInt(params.id) : undefined;
  
  const { data: existingResume, isLoading: isLoadingResume } = useQuery<Resume>({
    queryKey: [`/api/resumes/${resumeId}`],
    enabled: !!resumeId
  });
  
  // Update form data when existing resume is loaded
  useEffect(() => {
    if (existingResume) {
      setResumeData({
        title: existingResume.title,
        contact: existingResume.contact as ResumeData["contact"],
        summary: existingResume.summary || "",
        experience: existingResume.experience as ResumeData["experience"] || [],
        education: existingResume.education as ResumeData["education"] || [],
        skills: existingResume.skills as string[] || [],
        projects: existingResume.projects as ResumeData["projects"] || [],
        template: existingResume.template
      });
    }
  }, [existingResume]);
  
  // Save resume mutation
  const saveResumeMutation = useMutation({
    mutationFn: (data: InsertResume) => {
      if (resumeId) {
        return apiRequest("PUT", `/api/resumes/${resumeId}`, data);
      } else {
        return apiRequest("POST", "/api/resumes", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: resumeId ? "Resume updated" : "Resume saved",
        description: resumeId 
          ? "Your resume has been updated successfully." 
          : "Your resume has been saved successfully.",
      });
      
      if (!resumeId) {
        // If it was a new resume, navigate to dashboard
        navigate("/jobseeker/dashboard");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "There was an error saving your resume.",
        variant: "destructive",
      });
    }
  });
  
  const handleSaveResume = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save a resume.",
        variant: "destructive",
      });
      return;
    }
    
    const resumeToSave: InsertResume = {
      userId: user.id,
      title: resumeData.title,
      contact: resumeData.contact,
      summary: resumeData.summary,
      experience: resumeData.experience,
      education: resumeData.education,
      skills: resumeData.skills,
      projects: resumeData.projects,
      template: resumeData.template
    };
    
    saveResumeMutation.mutate(resumeToSave);
  };
  
  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateResumePDF(resumeData, resumeData.template);
      toast({
        title: "PDF Generated",
        description: "Your resume has been generated and downloaded.",
      });
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
      console.error("PDF generation error:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  if (isLoadingResume) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-10 w-1/3 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[600px] w-full" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/jobseeker/dashboard")}
              className="mb-2"
            >
              <ChevronLeft size={16} className="mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {resumeId ? "Edit Resume" : "Create New Resume"}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleSaveResume}
              disabled={saveResumeMutation.isPending}
            >
              <Save size={16} className="mr-2" />
              {saveResumeMutation.isPending ? "Saving..." : "Save Resume"}
            </Button>
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
            >
              <Download size={16} className="mr-2" />
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="edit" className="flex items-center">
              <FileText size={16} className="mr-2" />
              Edit Resume
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center">
              <Eye size={16} className="mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="mt-0">
            <ResumeForms 
              resumeData={resumeData} 
              setResumeData={setResumeData} 
            />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Resume Preview</CardTitle>
                <CardDescription>
                  This is how your resume will look when generated as a PDF.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumePreview resumeData={resumeData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
