import { ResumeData } from "@/lib/pdf";

interface ResumePreviewProps {
  resumeData: ResumeData;
}

export function ResumePreview({ resumeData }: ResumePreviewProps) {
  const getTemplateContent = () => {
    switch (resumeData.template) {
      case 'professional':
        return renderProfessionalTemplate();
      case 'creative':
        return renderCreativeTemplate();
      case 'minimalist':
        return renderMinimalistTemplate();
      case 'modern':
      default:
        return renderModernTemplate();
    }
  };
  
  const renderModernTemplate = () => {
    return (
      <div className="font-sans text-gray-800 p-8 max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow">
        {/* Header Section */}
        <header className="text-center mb-8 pb-6 border-b-2 border-primary">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{resumeData.contact.name || "Your Name"}</h1>
          <div className="text-sm">
            <span>{resumeData.contact.email || "your.email@example.com"}</span>
            {" | "}
            <span>{resumeData.contact.phone || "(555) 123-4567"}</span>
            {resumeData.contact.address && (
              <>
                {" | "}
                <span>{resumeData.contact.address}</span>
              </>
            )}
            {resumeData.contact.linkedin && (
              <>
                {" | "}
                <a href={resumeData.contact.linkedin} className="text-primary hover:underline">LinkedIn</a>
              </>
            )}
            {resumeData.contact.website && (
              <>
                {" | "}
                <a href={resumeData.contact.website} className="text-primary hover:underline">Website</a>
              </>
            )}
          </div>
        </header>

        {/* Summary Section */}
        {resumeData.summary && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b border-gray-200 pb-1 mb-3 text-primary">PROFESSIONAL SUMMARY</h2>
            <p className="text-sm">{resumeData.summary}</p>
          </section>
        )}

        {/* Experience Section */}
        {resumeData.experience && resumeData.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b border-gray-200 pb-1 mb-3 text-primary">WORK EXPERIENCE</h2>
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between flex-wrap">
                  <h3 className="text-base font-bold">{exp.position}</h3>
                  <span className="text-sm">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-sm italic mb-1">{exp.company}</div>
                <p className="text-sm">{exp.description}</p>
              </div>
            ))}
          </section>
        )}

        {/* Education Section */}
        {resumeData.education && resumeData.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b border-gray-200 pb-1 mb-3 text-primary">EDUCATION</h2>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between flex-wrap">
                  <h3 className="text-base font-bold">{edu.degree} in {edu.field}</h3>
                  <span className="text-sm">
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </span>
                </div>
                <div className="text-sm italic mb-1">{edu.institution}</div>
                {edu.description && <p className="text-sm">{edu.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Skills Section */}
        {resumeData.skills && resumeData.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b border-gray-200 pb-1 mb-3 text-primary">SKILLS</h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <section>
            <h2 className="text-xl font-bold border-b border-gray-200 pb-1 mb-3 text-primary">PROJECTS</h2>
            {resumeData.projects.map((project, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-base font-bold">
                  {project.name}
                  {project.url && (
                    <a href={project.url} className="text-primary hover:underline text-sm ml-2">
                      View Project
                    </a>
                  )}
                </h3>
                <p className="text-sm mb-1">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="text-sm">
                    <span className="font-bold">Technologies:</span> {project.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    );
  };
  
  const renderProfessionalTemplate = () => {
    return (
      <div className="font-serif text-gray-800 p-8 max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow">
        {/* Header Section */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{resumeData.contact.name || "Your Name"}</h1>
          <div className="text-sm">
            <span>{resumeData.contact.email || "your.email@example.com"}</span>
            {" | "}
            <span>{resumeData.contact.phone || "(555) 123-4567"}</span>
            {resumeData.contact.address && (
              <>
                {" | "}
                <span>{resumeData.contact.address}</span>
              </>
            )}
            {resumeData.contact.linkedin && (
              <>
                {" | "}
                <a href={resumeData.contact.linkedin} className="text-gray-800 hover:underline">LinkedIn</a>
              </>
            )}
            {resumeData.contact.website && (
              <>
                {" | "}
                <a href={resumeData.contact.website} className="text-gray-800 hover:underline">Website</a>
              </>
            )}
          </div>
        </header>

        {/* Summary Section */}
        {resumeData.summary && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-3">OBJECTIVE</h2>
            <p className="text-sm">{resumeData.summary}</p>
          </section>
        )}

        {/* Experience Section */}
        {resumeData.experience && resumeData.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-3">PROFESSIONAL EXPERIENCE</h2>
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between flex-wrap">
                  <h3 className="text-base font-bold">{exp.position}, {exp.company}</h3>
                  <span className="text-sm">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <p className="text-sm">{exp.description}</p>
              </div>
            ))}
          </section>
        )}

        {/* Education Section */}
        {resumeData.education && resumeData.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-3">EDUCATION</h2>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between flex-wrap">
                  <h3 className="text-base font-bold">{edu.degree} in {edu.field}</h3>
                  <span className="text-sm">
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </span>
                </div>
                <div className="text-sm mb-1">{edu.institution}</div>
                {edu.description && <p className="text-sm">{edu.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Skills Section */}
        {resumeData.skills && resumeData.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-3">SKILLS</h2>
            <p className="text-sm">{resumeData.skills.join(', ')}</p>
          </section>
        )}

        {/* Projects Section */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <section>
            <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-3">PROJECTS</h2>
            {resumeData.projects.map((project, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-base font-bold">
                  {project.name}
                  {project.url && (
                    <a href={project.url} className="text-gray-800 hover:underline text-sm ml-2">
                      (Link)
                    </a>
                  )}
                </h3>
                <p className="text-sm mb-1">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="text-sm">
                    <span className="font-bold">Technologies:</span> {project.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    );
  };
  
  const renderCreativeTemplate = () => {
    return (
      <div className="font-sans text-gray-800 p-0 max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Sidebar */}
          <div className="bg-purple-600 p-6 text-white md:w-1/3">
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-full bg-white text-purple-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {resumeData.contact.name ? resumeData.contact.name.charAt(0) : "Y"}
              </div>
              <h1 className="text-xl font-bold">{resumeData.contact.name || "Your Name"}</h1>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 border-b border-white pb-1">CONTACT</h2>
              <div className="space-y-2 text-sm">
                <div>{resumeData.contact.email || "your.email@example.com"}</div>
                <div>{resumeData.contact.phone || "(555) 123-4567"}</div>
                {resumeData.contact.address && <div>{resumeData.contact.address}</div>}
                {resumeData.contact.linkedin && (
                  <div>
                    <a href={resumeData.contact.linkedin} className="text-white hover:underline">LinkedIn</a>
                  </div>
                )}
                {resumeData.contact.website && (
                  <div>
                    <a href={resumeData.contact.website} className="text-white hover:underline">Website</a>
                  </div>
                )}
              </div>
            </div>
            
            {resumeData.skills && resumeData.skills.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 border-b border-white pb-1">SKILLS</h2>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, index) => (
                    <span key={index} className="bg-purple-700 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Main Content */}
          <div className="p-6 md:w-2/3">
            {resumeData.summary && (
              <section className="mb-6">
                <p className="text-sm">{resumeData.summary}</p>
              </section>
            )}
            
            {resumeData.experience && resumeData.experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xl font-bold mb-4 text-purple-600">EXPERIENCE</h2>
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="mb-4 pl-4 border-l-2 border-purple-200">
                    <div className="flex justify-between flex-wrap">
                      <h3 className="text-base font-bold text-gray-800">{exp.position}</h3>
                      <span className="text-sm text-gray-600">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-600 mb-1">{exp.company}</div>
                    <p className="text-sm text-gray-700">{exp.description}</p>
                  </div>
                ))}
              </section>
            )}
            
            {resumeData.education && resumeData.education.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xl font-bold mb-4 text-purple-600">EDUCATION</h2>
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="mb-4 pl-4 border-l-2 border-purple-200">
                    <div className="flex justify-between flex-wrap">
                      <h3 className="text-base font-bold text-gray-800">{edu.degree} in {edu.field}</h3>
                      <span className="text-sm text-gray-600">
                        {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-600 mb-1">{edu.institution}</div>
                    {edu.description && <p className="text-sm text-gray-700">{edu.description}</p>}
                  </div>
                ))}
              </section>
            )}
            
            {resumeData.projects && resumeData.projects.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 text-purple-600">PROJECTS</h2>
                {resumeData.projects.map((project, index) => (
                  <div key={index} className="mb-4 pl-4 border-l-2 border-purple-200">
                    <h3 className="text-base font-bold text-gray-800">
                      {project.name}
                      {project.url && (
                        <a href={project.url} className="text-purple-600 hover:underline text-sm ml-2">
                          View
                        </a>
                      )}
                    </h3>
                    <p className="text-sm text-gray-700 mb-1">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderMinimalistTemplate = () => {
    return (
      <div className="font-sans text-gray-800 p-8 max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow">
        {/* Header Section */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold mb-2 text-gray-900">{resumeData.contact.name || "Your Name"}</h1>
          <div className="text-sm text-gray-600">
            <span>{resumeData.contact.email || "your.email@example.com"}</span>
            {" · "}
            <span>{resumeData.contact.phone || "(555) 123-4567"}</span>
            {resumeData.contact.address && (
              <>
                {" · "}
                <span>{resumeData.contact.address}</span>
              </>
            )}
            {resumeData.contact.linkedin && (
              <>
                {" · "}
                <a href={resumeData.contact.linkedin} className="text-gray-600 hover:underline">LinkedIn</a>
              </>
            )}
            {resumeData.contact.website && (
              <>
                {" · "}
                <a href={resumeData.contact.website} className="text-gray-600 hover:underline">Website</a>
              </>
            )}
          </div>
        </header>

        {/* Thin divider */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Summary Section */}
        {resumeData.summary && (
          <section className="mb-6">
            <p className="text-sm leading-relaxed">{resumeData.summary}</p>
          </section>
        )}

        {/* Experience Section */}
        {resumeData.experience && resumeData.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-4 uppercase tracking-wide text-gray-700">Experience</h2>
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="mb-5">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-medium text-gray-900">{exp.position}</h3>
                  <span className="text-xs text-gray-600">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </section>
        )}

        {/* Education Section */}
        {resumeData.education && resumeData.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-4 uppercase tracking-wide text-gray-700">Education</h2>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-medium text-gray-900">{edu.degree} in {edu.field}</h3>
                  <span className="text-xs text-gray-600">
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{edu.institution}</p>
                {edu.description && <p className="text-sm text-gray-700 leading-relaxed">{edu.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Skills Section */}
        {resumeData.skills && resumeData.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide text-gray-700">Skills</h2>
            <p className="text-sm text-gray-700">
              {resumeData.skills.join(' · ')}
            </p>
          </section>
        )}

        {/* Projects Section */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 uppercase tracking-wide text-gray-700">Projects</h2>
            {resumeData.projects.map((project, index) => (
              <div key={index} className="mb-4">
                <div className="flex items-center mb-1">
                  <h3 className="text-base font-medium text-gray-900 mr-2">
                    {project.name}
                  </h3>
                  {project.url && (
                    <a href={project.url} className="text-gray-500 hover:text-gray-700 text-xs">
                      [link]
                    </a>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-1">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    {project.technologies.join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    );
  };
  
  return getTemplateContent();
}
