import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Pencil } from "lucide-react";
import { generateResumePDF } from "@/lib/pdf";

// Define the Resume interface based on MongoDB schema
interface Resume {
  _id: string;
  title: string;
  createdAt: string;
  content: {
    personalInfo: {
      name: string;
      email: string;
      phone?: string;
      location?: string;
      website?: string;
    };
    education: Array<{
      school: string;
      degree: string;
      fieldOfStudy: string;
      startDate: string;
      endDate?: string;
      description?: string;
    }>;
    experience: Array<{
      company: string;
      position: string;
      location?: string;
      startDate: string;
      endDate?: string;
      description: string;
    }>;
    skills: string[];
    projects?: Array<{
      name: string;
      description: string;
      technologies: string[];
      link?: string;
    }>;
  };
}

interface ResumePreviewProps {
  resume: Resume | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function ResumePreview({ resume, isOpen, onClose, onEdit }: ResumePreviewProps) {
  const handleDownload = async () => {
    if (!resume) return;
    
    try {
      await generateResumePDF(resume);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  };

  if (!resume) return null;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{resume.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Personal Info */}
          <div className="text-center">
            <h2 className="text-2xl font-bold">{resume.content.personalInfo.name}</h2>
            <div className="flex justify-center items-center gap-2 flex-wrap text-sm mt-2">
              {resume.content.personalInfo.email && (
                <span>{resume.content.personalInfo.email}</span>
              )}
              {resume.content.personalInfo.phone && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span>{resume.content.personalInfo.phone}</span>
                </>
              )}
              {resume.content.personalInfo.location && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span>{resume.content.personalInfo.location}</span>
                </>
              )}
              {resume.content.personalInfo.website && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <a href={resume.content.personalInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {resume.content.personalInfo.website.replace(/^https?:\/\//, '')}
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Skills */}
          {resume.content.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-bold border-b pb-1 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resume.content.skills.map((skill, index) => (
                  <span key={index} className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {resume.content.experience.length > 0 && (
            <div>
              <h3 className="text-lg font-bold border-b pb-1 mb-2">Experience</h3>
              <div className="space-y-4">
                {resume.content.experience.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">{exp.position}</h4>
                        <h5 className="text-gray-700 dark:text-gray-300">{exp.company}</h5>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                      </div>
                    </div>
                    {exp.location && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{exp.location}</div>
                    )}
                    <p className="text-sm whitespace-pre-line">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume.content.education.length > 0 && (
            <div>
              <h3 className="text-lg font-bold border-b pb-1 mb-2">Education</h3>
              <div className="space-y-4">
                {resume.content.education.map((edu, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">{edu.school}</h4>
                        <h5 className="text-gray-700 dark:text-gray-300">{edu.degree}, {edu.fieldOfStudy}</h5>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </div>
                    </div>
                    {edu.description && (
                      <p className="text-sm whitespace-pre-line mt-1">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume.content.projects && resume.content.projects.length > 0 && (
            <div>
              <h3 className="text-lg font-bold border-b pb-1 mb-2">Projects</h3>
              <div className="space-y-4">
                {resume.content.projects.map((project, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold">{project.name}</h4>
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          View Project
                        </a>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-line">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
