// Removed unused React import
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Resume } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Download, Eye, Pencil, Trash } from "lucide-react";
import { generateResumePDF } from "@/lib/pdf";

interface ResumeCardProps {
  resume: Resume;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export default function ResumeCard({ resume, onEdit, onDelete, onView }: ResumeCardProps) {
  const handleDownload = async () => {
    try {
      // Cast resume to expected type for PDF generation
      await generateResumePDF(resume as any);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{resume.title}</CardTitle>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Created: {resume.createdAt ? formatDate(new Date(resume.createdAt)) : 'N/A'}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="text-sm">
          <p className="line-clamp-3">
            {resume.content.personalInfo.name ? `Resume for ${resume.content.personalInfo.name}` : "No name provided."}
          </p>
        </div>
        <div className="mt-2 text-sm">
          <span className="font-medium">Skills:</span> {resume.content.skills.slice(0, 3).join(', ')}{resume.content.skills.length > 3 ? '...' : ''}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between gap-2">
        <Button
          variant="outline" 
          size="sm"
          onClick={onView}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          variant="outline" 
          size="sm"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline" 
          size="sm"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-1" />
          PDF
        </Button>
        <Button
          variant="outline" 
          size="sm"
          onClick={onDelete}
          className="text-red-500 hover:text-red-600"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}