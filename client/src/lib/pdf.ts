import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

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

/**
 * Format a date string to a more readable format
 */
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Present';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

/**
 * Generate a PDF from a resume object
 */
export const generateResumePDF = async (resume: Resume): Promise<void> => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set document properties
  doc.setProperties({
    title: resume.title,
    subject: 'Resume',
    author: resume.content.personalInfo.name,
    creator: 'JobHub Resume Builder'
  });

  // Add header with personal information
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(resume.content.personalInfo.name, 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Contact info line
  const contactInfo = [
    resume.content.personalInfo.email,
    resume.content.personalInfo.phone,
    resume.content.personalInfo.location,
    resume.content.personalInfo.website
  ].filter(Boolean).join(' | ');
  
  doc.text(contactInfo, 105, 27, { align: 'center' });

  let yPos = 35;

  // Add skills section
  if (resume.content.skills.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Skills', 20, yPos);
    
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 1, 190, yPos + 1);
    
    yPos += 7;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const skillsText = resume.content.skills.join(', ');
    
    // Handle text wrapping for skills
    const splitSkills = doc.splitTextToSize(skillsText, 170);
    doc.text(splitSkills, 20, yPos);
    
    yPos += splitSkills.length * 5 + 5;
  }

  // Add experience section
  if (resume.content.experience.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Professional Experience', 20, yPos);
    
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 1, 190, yPos + 1);
    
    yPos += 7;
    
    resume.content.experience.forEach((exp) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.position, 20, yPos);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(exp.company, 20, yPos + 5);
      
      if (exp.location) {
        doc.text(exp.location, 20, yPos + 10);
      }
      
      // Date range on the right
      const dateRange = `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`;
      doc.setFont('helvetica', 'normal');
      doc.text(dateRange, 190, yPos, { align: 'right' });
      
      // Description
      yPos += exp.location ? 15 : 10;
      const splitDescription = doc.splitTextToSize(exp.description, 170);
      doc.text(splitDescription, 20, yPos);
      
      yPos += splitDescription.length * 5 + 5;
    });
  }

  // Add education section
  if (resume.content.education.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Education', 20, yPos);
    
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 1, 190, yPos + 1);
    
    yPos += 7;
    
    resume.content.education.forEach((edu) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.school, 20, yPos);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`${edu.degree}, ${edu.fieldOfStudy}`, 20, yPos + 5);
      
      // Date range on the right
      const dateRange = `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
      doc.setFont('helvetica', 'normal');
      doc.text(dateRange, 190, yPos, { align: 'right' });
      
      // Description if available
      if (edu.description) {
        yPos += 10;
        const splitDescription = doc.splitTextToSize(edu.description, 170);
        doc.text(splitDescription, 20, yPos);
        yPos += splitDescription.length * 5;
      }
      
      yPos += 10;
    });
  }

  // Add projects section
  if (resume.content.projects && resume.content.projects.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Projects', 20, yPos);
    
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 1, 190, yPos + 1);
    
    yPos += 7;
    
    resume.content.projects.forEach((project) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(project.name, 20, yPos);
      
      if (project.link) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(0, 0, 255);
        doc.text(project.link, 190, yPos, { align: 'right' });
        doc.setTextColor(0, 0, 0);
      }
      
      // Description
      yPos += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitDescription = doc.splitTextToSize(project.description, 170);
      doc.text(splitDescription, 20, yPos);
      
      yPos += splitDescription.length * 5;
      
      // Technologies
      if (project.technologies.length > 0) {
        doc.setFont('helvetica', 'italic');
        const techText = `Technologies: ${project.technologies.join(', ')}`;
        const splitTech = doc.splitTextToSize(techText, 170);
        doc.text(splitTech, 20, yPos);
        yPos += splitTech.length * 5;
      }
      
      yPos += 5;
    });
  }

  // Add footer with page number and date
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save the PDF with the resume title
  const fileName = `${resume.title.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};

export default {
  generateResumePDF
};
