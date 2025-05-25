import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { isAuthenticated, isJobSeeker } from "@/lib/utils";

// Template information
const resumeTemplates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and contemporary design",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Traditional format for corporate roles",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Stand out with a unique design",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Simple and elegant layout",
  },
];

export default function ResumeTemplates() {
  const navigateToResumeBuilder = (templateId: string) => {
    if (isAuthenticated() && isJobSeeker()) {
      window.location.href = `/resume-builder?template=${templateId}`;
    } else {
      document.dispatchEvent(
        new CustomEvent("open-auth-modal", { detail: { mode: "signUp" } })
      );
    }
  };

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Professional Resume Templates
          </h2>
          <p className="mt-2 text-lg text-gray-500">
            Choose from our collection of ATS-friendly templates
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resumeTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-3 aspect-h-4 bg-gray-100">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 400 500"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {template.id === "modern" && (
                    <>
                      <rect width="400" height="500" fill="white" />
                      <rect x="0" y="0" width="400" height="80" fill="#3b82f6" />
                      <circle cx="60" cy="40" r="30" fill="white" />
                      <rect x="100" y="30" width="150" height="10" rx="2" fill="white" />
                      <rect x="100" y="50" width="100" height="6" rx="2" fill="rgba(255,255,255,0.7)" />
                      <rect x="30" y="100" width="340" height="15" rx="2" fill="#e5e7eb" />
                      <rect x="30" y="130" width="340" height="1" fill="#e5e7eb" />
                      <rect x="30" y="150" width="150" height="10" rx="2" fill="#374151" />
                      <rect x="30" y="170" width="340" height="30" rx="2" fill="#f3f4f6" />
                      <rect x="30" y="210" width="150" height="10" rx="2" fill="#374151" />
                      <rect x="30" y="230" width="340" height="60" rx="2" fill="#f3f4f6" />
                      <rect x="30" y="300" width="150" height="10" rx="2" fill="#374151" />
                      <rect x="30" y="320" width="340" height="60" rx="2" fill="#f3f4f6" />
                      <rect x="30" y="390" width="150" height="10" rx="2" fill="#374151" />
                      <rect x="30" y="410" width="80" height="25" rx="12" fill="#dbeafe" />
                      <rect x="120" y="410" width="80" height="25" rx="12" fill="#dbeafe" />
                      <rect x="210" y="410" width="80" height="25" rx="12" fill="#dbeafe" />
                    </>
                  )}

                  {template.id === "professional" && (
                    <>
                      <rect width="400" height="500" fill="white" />
                      <rect x="30" y="30" width="340" height="20" rx="2" fill="#111827" />
                      <rect x="30" y="60" width="340" height="10" rx="2" fill="#6b7280" />
                      <rect x="30" y="90" width="340" height="2" fill="#000000" />
                      <rect x="30" y="110" width="150" height="12" rx="2" fill="#111827" />
                      <rect x="30" y="130" width="340" height="40" rx="2" fill="white" />
                      <rect x="30" y="180" width="150" height="12" rx="2" fill="#111827" />
                      <rect x="30" y="200" width="340" height="1" fill="#000000" />
                      <rect x="30" y="210" width="150" height="10" rx="2" fill="#374151" />
                      <rect x="290" y="210" width="80" height="10" rx="2" fill="#6b7280" />
                      <rect x="30" y="230" width="340" height="40" rx="2" fill="white" />
                      <rect x="30" y="280" width="150" height="10" rx="2" fill="#374151" />
                      <rect x="290" y="280" width="80" height="10" rx="2" fill="#6b7280" />
                      <rect x="30" y="300" width="340" height="40" rx="2" fill="white" />
                      <rect x="30" y="350" width="150" height="12" rx="2" fill="#111827" />
                      <rect x="30" y="370" width="340" height="1" fill="#000000" />
                      <rect x="30" y="380" width="340" height="10" rx="2" fill="#374151" />
                      <rect x="30" y="400" width="340" height="10" rx="2" fill="#374151" />
                      <rect x="30" y="420" width="340" height="10" rx="2" fill="#374151" />
                    </>
                  )}

                  {template.id === "creative" && (
                    <>
                      <rect width="400" height="500" fill="white" />
                      <rect x="0" y="0" width="150" height="500" fill="#8b5cf6" />
                      <circle cx="75" cy="100" r="50" fill="white" />
                      <rect x="50" y="170" width="50" height="10" rx="2" fill="white" />
                      <rect x="30" y="190" width="90" height="6" rx="2" fill="rgba(255,255,255,0.7)" />
                      <rect x="30" y="210" width="90" height="6" rx="2" fill="rgba(255,255,255,0.7)" />
                      <rect x="20" y="240" width="110" height="15" rx="2" fill="white" />
                      <rect x="20" y="270" width="110" height="40" rx="2" fill="rgba(255,255,255,0.2)" />
                      <rect x="20" y="320" width="110" height="15" rx="2" fill="white" />
                      <rect x="20" y="350" width="50" height="20" rx="10" fill="rgba(255,255,255,0.2)" />
                      <rect x="80" y="350" width="50" height="20" rx="10" fill="rgba(255,255,255,0.2)" />
                      <rect x="20" y="380" width="50" height="20" rx="10" fill="rgba(255,255,255,0.2)" />
                      <rect x="170" y="50" width="200" height="20" rx="2" fill="#111827" />
                      <rect x="170" y="80" width="200" height="40" rx="2" fill="#f3f4f6" />
                      <rect x="170" y="140" width="150" height="15" rx="2" fill="#8b5cf6" />
                      <rect x="170" y="165" width="200" height="10" rx="2" fill="#6b7280" />
                      <rect x="170" y="185" width="200" height="10" rx="2" fill="#6b7280" />
                      <rect x="170" y="240" width="150" height="15" rx="2" fill="#8b5cf6" />
                      <rect x="170" y="265" width="200" height="40" rx="2" fill="#f3f4f6" />
                      <rect x="170" y="320" width="150" height="15" rx="2" fill="#8b5cf6" />
                      <rect x="170" y="345" width="200" height="40" rx="2" fill="#f3f4f6" />
                    </>
                  )}

                  {template.id === "minimalist" && (
                    <>
                      <rect width="400" height="500" fill="white" />
                      <rect x="30" y="40" width="200" height="15" rx="2" fill="#111827" />
                      <rect x="30" y="65" width="340" height="8" rx="2" fill="#6b7280" />
                      <rect x="30" y="90" width="340" height="1" fill="#e5e7eb" />
                      <rect x="30" y="110" width="340" height="8" rx="2" fill="#374151" />
                      <rect x="30" y="130" width="100" height="10" rx="2" fill="#111827" />
                      <rect x="290" y="130" width="80" height="8" rx="2" fill="#6b7280" />
                      <rect x="30" y="150" width="80" height="8" rx="2" fill="#6b7280" />
                      <rect x="30" y="170" width="340" height="8" rx="2" fill="#374151" />
                      <rect x="30" y="190" width="340" height="8" rx="2" fill="#374151" />
                      <rect x="30" y="220" width="100" height="10" rx="2" fill="#111827" />
                      <rect x="290" y="220" width="80" height="8" rx="2" fill="#6b7280" />
                      <rect x="30" y="240" width="80" height="8" rx="2" fill="#6b7280" />
                      <rect x="30" y="260" width="340" height="8" rx="2" fill="#374151" />
                      <rect x="30" y="280" width="340" height="8" rx="2" fill="#374151" />
                      <rect x="30" y="310" width="100" height="10" rx="2" fill="#111827" />
                      <rect x="30" y="330" width="340" height="8" rx="2" fill="#374151" />
                      <rect x="30" y="350" width="340" height="8" rx="2" fill="#374151" />
                      <rect x="30" y="370" width="340" height="8" rx="2" fill="#374151" />
                      <rect x="30" y="400" width="100" height="10" rx="2" fill="#111827" />
                      <rect x="30" y="420" width="50" height="8" rx="2" fill="#374151" />
                      <rect x="90" y="420" width="50" height="8" rx="2" fill="#374151" />
                      <rect x="150" y="420" width="50" height="8" rx="2" fill="#374151" />
                      <rect x="210" y="420" width="50" height="8" rx="2" fill="#374151" />
                    </>
                  )}
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                <Button
                  variant="link"
                  className="text-primary hover:text-primary/90 p-0 h-auto"
                  onClick={() => navigateToResumeBuilder(template.id)}
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
