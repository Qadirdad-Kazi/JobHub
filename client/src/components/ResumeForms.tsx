import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";
import { api } from '../lib/api';

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

interface ResumeFormProps {
  resume: Resume | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ResumeForm({ resume, isOpen, onClose, onSave }: ResumeFormProps) {
  const [formData, setFormData] = useState(resume || {
    _id: '',
    title: '',
    createdAt: new Date().toISOString(),
    content: {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        website: ''
      },
      education: [{
        school: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        description: ''
      }],
      experience: [{
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        description: ''
      }],
      skills: [],
      projects: [{
        name: '',
        description: '',
        technologies: [],
        link: ''
      }]
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form field changes
  const handleChange = (section: string, field: string, value: string, index?: number) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (section === 'personalInfo') {
        newData.content.personalInfo = {
          ...newData.content.personalInfo,
          [field]: value
        };
      } else if (section === 'title') {
        newData.title = value;
      } else if (section === 'skills') {
        newData.content.skills = value.split(',').map(skill => skill.trim());
      } else if (section === 'education' && index !== undefined) {
        newData.content.education[index] = {
          ...newData.content.education[index],
          [field]: value
        };
      } else if (section === 'experience' && index !== undefined) {
        newData.content.experience[index] = {
          ...newData.content.experience[index],
          [field]: value
        };
      } else if (section === 'projects' && index !== undefined) {
        if (field === 'technologies') {
          newData.content.projects![index] = {
            ...newData.content.projects![index],
            technologies: value.split(',').map(tech => tech.trim())
          };
        } else {
          newData.content.projects![index] = {
            ...newData.content.projects![index],
            [field]: value
          };
        }
      }
      
      return newData;
    });
  };

  const addItem = (section: 'education' | 'experience' | 'projects') => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (section === 'education') {
        newData.content.education.push({
          school: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          description: ''
        });
      } else if (section === 'experience') {
        newData.content.experience.push({
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          description: ''
        });
      } else if (section === 'projects') {
        if (!newData.content.projects) {
          newData.content.projects = [];
        }
        newData.content.projects.push({
          name: '',
          description: '',
          technologies: [],
          link: ''
        });
      }
      
      return newData;
    });
  };

  const removeItem = (section: 'education' | 'experience' | 'projects', index: number) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (section === 'education') {
        newData.content.education = newData.content.education.filter((_, i) => i !== index);
      } else if (section === 'experience') {
        newData.content.experience = newData.content.experience.filter((_, i) => i !== index);
      } else if (section === 'projects') {
        newData.content.projects = newData.content.projects!.filter((_, i) => i !== index);
      }
      
      return newData;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Use the centralized API client with proper authentication
      console.log('Saving resume to database:', formData);
      
      if (resume && resume._id) {
        // Update existing resume
        await api.put(`/api/resumes/${resume._id}`, formData);
      } else {
        // Create new resume
        await api.post('/api/resumes', formData);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving resume:', error);
      setError('Failed to save resume. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resume ? 'Edit Resume' : 'Create Resume'}</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-6 py-4">
          {/* Resume Title */}
          <div>
            <Label htmlFor="title">Resume Title</Label>
            <Input 
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', '', e.target.value)}
              placeholder="e.g. Software Developer Resume"
            />
          </div>
          
          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-bold mb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name"
                  value={formData.content.personalInfo.name}
                  onChange={(e) => handleChange('personalInfo', 'name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={formData.content.personalInfo.email}
                  onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone"
                  value={formData.content.personalInfo.phone}
                  onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location"
                  value={formData.content.personalInfo.location}
                  onChange={(e) => handleChange('personalInfo', 'location', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website"
                  value={formData.content.personalInfo.website}
                  onChange={(e) => handleChange('personalInfo', 'website', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Skills */}
          <div>
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Textarea 
              id="skills"
              value={formData.content.skills.join(', ')}
              onChange={(e) => handleChange('skills', '', e.target.value)}
              placeholder="e.g. JavaScript, React, Node.js"
              className="h-20"
            />
          </div>
          
          {/* Experience */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">Experience</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => addItem('experience')}
              >
                Add Experience
              </Button>
            </div>
            
            {formData.content.experience.map((exp, index) => (
              <div key={index} className="border p-4 rounded-md mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Experience {index + 1}</h4>
                  {formData.content.experience.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem('experience', index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`exp-company-${index}`}>Company</Label>
                    <Input 
                      id={`exp-company-${index}`}
                      value={exp.company}
                      onChange={(e) => handleChange('experience', 'company', e.target.value, index)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`exp-position-${index}`}>Position</Label>
                    <Input 
                      id={`exp-position-${index}`}
                      value={exp.position}
                      onChange={(e) => handleChange('experience', 'position', e.target.value, index)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`exp-location-${index}`}>Location</Label>
                    <Input 
                      id={`exp-location-${index}`}
                      value={exp.location}
                      onChange={(e) => handleChange('experience', 'location', e.target.value, index)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`exp-start-${index}`}>Start Date</Label>
                      <Input 
                        id={`exp-start-${index}`}
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => handleChange('experience', 'startDate', e.target.value, index)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exp-end-${index}`}>End Date</Label>
                      <Input 
                        id={`exp-end-${index}`}
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => handleChange('experience', 'endDate', e.target.value, index)}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`exp-desc-${index}`}>Description</Label>
                    <Textarea 
                      id={`exp-desc-${index}`}
                      value={exp.description}
                      onChange={(e) => handleChange('experience', 'description', e.target.value, index)}
                      className="h-20"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Education */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">Education</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => addItem('education')}
              >
                Add Education
              </Button>
            </div>
            
            {formData.content.education.map((edu, index) => (
              <div key={index} className="border p-4 rounded-md mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Education {index + 1}</h4>
                  {formData.content.education.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem('education', index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`edu-school-${index}`}>School</Label>
                    <Input 
                      id={`edu-school-${index}`}
                      value={edu.school}
                      onChange={(e) => handleChange('education', 'school', e.target.value, index)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                    <Input 
                      id={`edu-degree-${index}`}
                      value={edu.degree}
                      onChange={(e) => handleChange('education', 'degree', e.target.value, index)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edu-field-${index}`}>Field of Study</Label>
                    <Input 
                      id={`edu-field-${index}`}
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleChange('education', 'fieldOfStudy', e.target.value, index)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`edu-start-${index}`}>Start Date</Label>
                      <Input 
                        id={`edu-start-${index}`}
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => handleChange('education', 'startDate', e.target.value, index)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edu-end-${index}`}>End Date</Label>
                      <Input 
                        id={`edu-end-${index}`}
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => handleChange('education', 'endDate', e.target.value, index)}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`edu-desc-${index}`}>Description</Label>
                    <Textarea 
                      id={`edu-desc-${index}`}
                      value={edu.description}
                      onChange={(e) => handleChange('education', 'description', e.target.value, index)}
                      className="h-20"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Projects */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">Projects</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => addItem('projects')}
              >
                Add Project
              </Button>
            </div>
            
            {formData.content.projects && formData.content.projects.map((project, index) => (
              <div key={index} className="border p-4 rounded-md mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Project {index + 1}</h4>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeItem('projects', index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`proj-name-${index}`}>Project Name</Label>
                    <Input 
                      id={`proj-name-${index}`}
                      value={project.name}
                      onChange={(e) => handleChange('projects', 'name', e.target.value, index)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`proj-link-${index}`}>Project Link</Label>
                    <Input 
                      id={`proj-link-${index}`}
                      value={project.link}
                      onChange={(e) => handleChange('projects', 'link', e.target.value, index)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`proj-desc-${index}`}>Description</Label>
                    <Textarea 
                      id={`proj-desc-${index}`}
                      value={project.description}
                      onChange={(e) => handleChange('projects', 'description', e.target.value, index)}
                      className="h-20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`proj-tech-${index}`}>Technologies (comma separated)</Label>
                    <Input 
                      id={`proj-tech-${index}`}
                      value={project.technologies.join(', ')}
                      onChange={(e) => handleChange('projects', 'technologies', e.target.value, index)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Resume'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
