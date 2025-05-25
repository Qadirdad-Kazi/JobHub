import html2pdf from 'html2pdf.js';

export interface ResumeData {
  title: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience?: {
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description: string;
  }[];
  education?: {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }[];
  skills?: string[];
  projects?: {
    name: string;
    description: string;
    url?: string;
    technologies?: string[];
  }[];
  template: string;
}

export function generateResumePDF(resumeData: ResumeData, template = "modern"): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary div to render the resume
      const resumeContainer = document.createElement('div');
      resumeContainer.style.width = '8.5in';
      resumeContainer.style.minHeight = '11in';
      resumeContainer.style.position = 'absolute';
      resumeContainer.style.left = '-9999px';
      resumeContainer.style.top = '-9999px';
      
      // Append to body temporarily
      document.body.appendChild(resumeContainer);
      
      // Populate with the resume HTML based on template
      resumeContainer.innerHTML = getResumeHTML(resumeData, template);
      
      // Configure pdf options
      const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${resumeData.contact.name}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      // Generate PDF
      html2pdf()
        .set(options)
        .from(resumeContainer)
        .save()
        .then(() => {
          // Clean up
          document.body.removeChild(resumeContainer);
          resolve();
        })
        .catch((error) => {
          document.body.removeChild(resumeContainer);
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}

function getResumeHTML(data: ResumeData, template: string): string {
  switch (template) {
    case 'professional':
      return getProfessionalTemplate(data);
    case 'creative':
      return getCreativeTemplate(data);
    case 'minimalist':
      return getMinimalistTemplate(data);
    case 'modern':
    default:
      return getModernTemplate(data);
  }
}

function getModernTemplate(data: ResumeData): string {
  return `
    <div style="font-family: 'Arial', sans-serif; color: #333; line-height: 1.5;">
      <!-- Header Section -->
      <header style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 5px; color: #1e3a8a;">${data.contact.name}</h1>
        <div style="font-size: 14px;">
          ${data.contact.email} | ${data.contact.phone}
          ${data.contact.address ? ` | ${data.contact.address}` : ''}
          ${data.contact.linkedin ? ` | <a href="${data.contact.linkedin}" style="color: #3b82f6; text-decoration: none;">LinkedIn</a>` : ''}
          ${data.contact.website ? ` | <a href="${data.contact.website}" style="color: #3b82f6; text-decoration: none;">Website</a>` : ''}
        </div>
      </header>

      <!-- Summary Section -->
      ${data.summary ? `
      <section style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #1e3a8a;">PROFESSIONAL SUMMARY</h2>
        <p style="margin-top: 10px;">${data.summary}</p>
      </section>
      ` : ''}

      <!-- Experience Section -->
      ${data.experience && data.experience.length > 0 ? `
      <section style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #1e3a8a;">WORK EXPERIENCE</h2>
        ${data.experience.map(exp => `
          <div style="margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
              <h3 style="font-size: 16px; font-weight: bold; margin: 0;">${exp.position}</h3>
              <span style="font-size: 14px;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
            </div>
            <div style="font-size: 15px; font-style: italic; margin-top: 3px;">${exp.company}</div>
            <p style="margin-top: 8px;">${exp.description}</p>
          </div>
        `).join('')}
      </section>
      ` : ''}

      <!-- Education Section -->
      ${data.education && data.education.length > 0 ? `
      <section style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #1e3a8a;">EDUCATION</h2>
        ${data.education.map(edu => `
          <div style="margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
              <h3 style="font-size: 16px; font-weight: bold; margin: 0;">${edu.degree} in ${edu.field}</h3>
              <span style="font-size: 14px;">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}</span>
            </div>
            <div style="font-size: 15px; font-style: italic; margin-top: 3px;">${edu.institution}</div>
            ${edu.description ? `<p style="margin-top: 8px;">${edu.description}</p>` : ''}
          </div>
        `).join('')}
      </section>
      ` : ''}

      <!-- Skills Section -->
      ${data.skills && data.skills.length > 0 ? `
      <section style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #1e3a8a;">SKILLS</h2>
        <div style="margin-top: 10px; display: flex; flex-wrap: wrap;">
          ${data.skills.map(skill => `
            <span style="background-color: #dbeafe; color: #1e40af; padding: 5px 10px; border-radius: 15px; margin: 3px; font-size: 14px;">${skill}</span>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <!-- Projects Section -->
      ${data.projects && data.projects.length > 0 ? `
      <section style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #1e3a8a;">PROJECTS</h2>
        ${data.projects.map(project => `
          <div style="margin-top: 15px;">
            <h3 style="font-size: 16px; font-weight: bold; margin: 0;">
              ${project.name}
              ${project.url ? `<a href="${project.url}" style="font-size: 14px; color: #3b82f6; text-decoration: none; margin-left: 10px;">View Project</a>` : ''}
            </h3>
            <p style="margin-top: 8px;">${project.description}</p>
            ${project.technologies && project.technologies.length > 0 ? `
              <div style="margin-top: 5px; font-size: 14px;">
                <span style="font-weight: bold;">Technologies:</span> ${project.technologies.join(', ')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </section>
      ` : ''}
    </div>
  `;
}

function getProfessionalTemplate(data: ResumeData): string {
  return `
    <div style="font-family: 'Times New Roman', serif; color: #333; line-height: 1.5;">
      <!-- Header Section -->
      <header style="text-align: center; margin-bottom: 20px; padding-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 5px; color: #000;">${data.contact.name}</h1>
        <div style="font-size: 14px;">
          ${data.contact.email} | ${data.contact.phone}
          ${data.contact.address ? ` | ${data.contact.address}` : ''}
          ${data.contact.linkedin ? ` | <a href="${data.contact.linkedin}" style="color: #000; text-decoration: none;">LinkedIn</a>` : ''}
          ${data.contact.website ? ` | <a href="${data.contact.website}" style="color: #000; text-decoration: none;">Website</a>` : ''}
        </div>
      </header>

      <!-- Summary Section -->
      ${data.summary ? `
      <section style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; color: #000;">OBJECTIVE</h2>
        <p style="margin-top: 10px;">${data.summary}</p>
      </section>
      ` : ''}

      <!-- Experience Section -->
      ${data.experience && data.experience.length > 0 ? `
      <section style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; color: #000;">PROFESSIONAL EXPERIENCE</h2>
        ${data.experience.map(exp => `
          <div style="margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
              <h3 style="font-size: 16px; font-weight: bold; margin: 0;">${exp.position}, ${exp.company}</h3>
              <span style="font-size: 14px;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
            </div>
            <p style="margin-top: 8px;">${exp.description}</p>
          </div>
        `).join('')}
      </section>
      ` : ''}

      <!-- Education Section -->
      ${data.education && data.education.length > 0 ? `
      <section style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; color: #000;">EDUCATION</h2>
        ${data.education.map(edu => `
          <div style="margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
              <h3 style="font-size: 16px; font-weight: bold; margin: 0;">${edu.degree} in ${edu.field}</h3>
              <span style="font-size: 14px;">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}</span>
            </div>
            <div style="font-size: 15px; margin-top: 3px;">${edu.institution}</div>
            ${edu.description ? `<p style="margin-top: 8px;">${edu.description}</p>` : ''}
          </div>
        `).join('')}
      </section>
      ` : ''}

      <!-- Skills Section -->
      ${data.skills && data.skills.length > 0 ? `
      <section style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; color: #000;">SKILLS</h2>
        <p style="margin-top: 10px;">${data.skills.join(', ')}</p>
      </section>
      ` : ''}

      <!-- Projects Section -->
      ${data.projects && data.projects.length > 0 ? `
      <section style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; color: #000;">PROJECTS</h2>
        ${data.projects.map(project => `
          <div style="margin-top: 15px;">
            <h3 style="font-size: 16px; font-weight: bold; margin: 0;">
              ${project.name}
              ${project.url ? `<a href="${project.url}" style="font-size: 14px; color: #000; text-decoration: none; margin-left: 10px;">(Link)</a>` : ''}
            </h3>
            <p style="margin-top: 8px;">${project.description}</p>
            ${project.technologies && project.technologies.length > 0 ? `
              <div style="margin-top: 5px; font-size: 14px;">
                <span style="font-weight: bold;">Technologies:</span> ${project.technologies.join(', ')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </section>
      ` : ''}
    </div>
  `;
}

function getCreativeTemplate(data: ResumeData): string {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.5;">
      <!-- Header Section with Background -->
      <header style="text-align: center; margin-bottom: 20px; padding: 30px 20px; background: linear-gradient(to right, #8b5cf6, #3b82f6); color: white;">
        <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">${data.contact.name}</h1>
        <div style="font-size: 14px;">
          ${data.contact.email} | ${data.contact.phone}
          ${data.contact.address ? ` | ${data.contact.address}` : ''}
        </div>
        <div style="margin-top: 10px;">
          ${data.contact.linkedin ? `<a href="${data.contact.linkedin}" style="color: white; text-decoration: none; margin: 0 5px;">LinkedIn</a>` : ''}
          ${data.contact.website ? `<a href="${data.contact.website}" style="color: white; text-decoration: none; margin: 0 5px;">Website</a>` : ''}
        </div>
      </header>

      <div style="padding: 0 20px;">
        <!-- Summary Section -->
        ${data.summary ? `
        <section style="margin-bottom: 25px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #8b5cf6; margin-bottom: 15px; display: inline-block; border-bottom: 3px solid #8b5cf6; padding-bottom: 5px;">ABOUT ME</h2>
          <p style="margin-top: 10px; line-height: 1.6;">${data.summary}</p>
        </section>
        ` : ''}

        <!-- Two Column Layout for the rest -->
        <div style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
          <!-- Left Column -->
          <div style="flex: 1; min-width: 300px; padding: 0 10px;">
            <!-- Experience Section -->
            ${data.experience && data.experience.length > 0 ? `
            <section style="margin-bottom: 25px;">
              <h2 style="font-size: 20px; font-weight: bold; color: #8b5cf6; margin-bottom: 15px; display: inline-block; border-bottom: 3px solid #8b5cf6; padding-bottom: 5px;">EXPERIENCE</h2>
              ${data.experience.map(exp => `
                <div style="margin-top: 15px; padding-left: 15px; border-left: 3px solid #e5e7eb;">
                  <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                    <h3 style="font-size: 16px; font-weight: bold; margin: 0; color: #4b5563;">${exp.position}</h3>
                    <span style="font-size: 14px; color: #6b7280;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div style="font-size: 15px; font-weight: 500; margin-top: 3px; color: #6b7280;">${exp.company}</div>
                  <p style="margin-top: 8px; color: #4b5563;">${exp.description}</p>
                </div>
              `).join('')}
            </section>
            ` : ''}

            <!-- Projects Section -->
            ${data.projects && data.projects.length > 0 ? `
            <section style="margin-bottom: 25px;">
              <h2 style="font-size: 20px; font-weight: bold; color: #8b5cf6; margin-bottom: 15px; display: inline-block; border-bottom: 3px solid #8b5cf6; padding-bottom: 5px;">PROJECTS</h2>
              ${data.projects.map(project => `
                <div style="margin-top: 15px; padding-left: 15px; border-left: 3px solid #e5e7eb;">
                  <h3 style="font-size: 16px; font-weight: bold; margin: 0; color: #4b5563;">
                    ${project.name}
                    ${project.url ? `<a href="${project.url}" style="font-size: 14px; color: #8b5cf6; text-decoration: none; margin-left: 10px;">View</a>` : ''}
                  </h3>
                  <p style="margin-top: 8px; color: #4b5563;">${project.description}</p>
                  ${project.technologies && project.technologies.length > 0 ? `
                    <div style="margin-top: 5px; display: flex; flex-wrap: wrap;">
                      ${project.technologies.map(tech => `
                        <span style="background-color: #f3e8ff; color: #8b5cf6; padding: 3px 8px; border-radius: 12px; margin: 2px; font-size: 12px;">${tech}</span>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </section>
            ` : ''}
          </div>

          <!-- Right Column -->
          <div style="flex: 1; min-width: 300px; padding: 0 10px;">
            <!-- Education Section -->
            ${data.education && data.education.length > 0 ? `
            <section style="margin-bottom: 25px;">
              <h2 style="font-size: 20px; font-weight: bold; color: #8b5cf6; margin-bottom: 15px; display: inline-block; border-bottom: 3px solid #8b5cf6; padding-bottom: 5px;">EDUCATION</h2>
              ${data.education.map(edu => `
                <div style="margin-top: 15px; padding-left: 15px; border-left: 3px solid #e5e7eb;">
                  <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                    <h3 style="font-size: 16px; font-weight: bold; margin: 0; color: #4b5563;">${edu.degree} in ${edu.field}</h3>
                    <span style="font-size: 14px; color: #6b7280;">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}</span>
                  </div>
                  <div style="font-size: 15px; font-weight: 500; margin-top: 3px; color: #6b7280;">${edu.institution}</div>
                  ${edu.description ? `<p style="margin-top: 8px; color: #4b5563;">${edu.description}</p>` : ''}
                </div>
              `).join('')}
            </section>
            ` : ''}

            <!-- Skills Section -->
            ${data.skills && data.skills.length > 0 ? `
            <section style="margin-bottom: 25px;">
              <h2 style="font-size: 20px; font-weight: bold; color: #8b5cf6; margin-bottom: 15px; display: inline-block; border-bottom: 3px solid #8b5cf6; padding-bottom: 5px;">SKILLS</h2>
              <div style="margin-top: 10px; display: flex; flex-wrap: wrap;">
                ${data.skills.map(skill => `
                  <span style="background-color: #f3e8ff; color: #8b5cf6; padding: 6px 12px; border-radius: 15px; margin: 4px; font-size: 14px;">${skill}</span>
                `).join('')}
              </div>
            </section>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function getMinimalistTemplate(data: ResumeData): string {
  return `
    <div style="font-family: 'Helvetica', sans-serif; color: #333; line-height: 1.5; max-width: 800px; margin: 0 auto;">
      <!-- Minimal Header -->
      <header style="margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 1px; margin-bottom: 10px; color: #333;">${data.contact.name}</h1>
        <div style="font-size: 14px; color: #666;">
          ${data.contact.email} · ${data.contact.phone}
          ${data.contact.address ? ` · ${data.contact.address}` : ''}
          ${data.contact.linkedin ? ` · <a href="${data.contact.linkedin}" style="color: #666; text-decoration: none;">LinkedIn</a>` : ''}
          ${data.contact.website ? ` · <a href="${data.contact.website}" style="color: #666; text-decoration: none;">Website</a>` : ''}
        </div>
      </header>

      <!-- Simple divider -->
      <div style="height: 1px; background-color: #ddd; margin-bottom: 30px;"></div>

      <!-- Summary Section -->
      ${data.summary ? `
      <section style="margin-bottom: 30px;">
        <p style="margin: 0; line-height: 1.6; color: #444;">${data.summary}</p>
      </section>
      ` : ''}

      <!-- Experience Section -->
      ${data.experience && data.experience.length > 0 ? `
      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; color: #333;">Experience</h2>
        ${data.experience.map(exp => `
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <h3 style="font-size: 16px; font-weight: 500; margin: 0; color: #333;">${exp.position}</h3>
              <span style="font-size: 14px; color: #666;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">${exp.company}</div>
            <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">${exp.description}</p>
          </div>
        `).join('')}
      </section>
      ` : ''}

      <!-- Education Section -->
      ${data.education && data.education.length > 0 ? `
      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; color: #333;">Education</h2>
        ${data.education.map(edu => `
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <h3 style="font-size: 16px; font-weight: 500; margin: 0; color: #333;">${edu.degree} in ${edu.field}</h3>
              <span style="font-size: 14px; color: #666;">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}</span>
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">${edu.institution}</div>
            ${edu.description ? `<p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">${edu.description}</p>` : ''}
          </div>
        `).join('')}
      </section>
      ` : ''}

      <!-- Skills Section -->
      ${data.skills && data.skills.length > 0 ? `
      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; color: #333;">Skills</h2>
        <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">${data.skills.join(' · ')}</p>
      </section>
      ` : ''}

      <!-- Projects Section -->
      ${data.projects && data.projects.length > 0 ? `
      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; color: #333;">Projects</h2>
        ${data.projects.map(project => `
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <h3 style="font-size: 16px; font-weight: 500; margin: 0; color: #333;">
                ${project.name}
                ${project.url ? `<a href="${project.url}" style="font-size: 14px; color: #666; text-decoration: none; margin-left: 10px;">[link]</a>` : ''}
              </h3>
            </div>
            <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">${project.description}</p>
            ${project.technologies && project.technologies.length > 0 ? `
              <div style="margin-top: 5px; font-size: 14px; color: #666;">
                ${project.technologies.join(' · ')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </section>
      ` : ''}
    </div>
  `;
}
