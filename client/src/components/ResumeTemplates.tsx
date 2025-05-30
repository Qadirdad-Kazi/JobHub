import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define template types
export type ResumeTemplate = {
  id: string;
  name: string;
  description: string;
  previewImage: string;
};

// Sample resume templates
const templates: ResumeTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'A traditional resume layout with a clean, professional appearance.',
    previewImage: '/templates/classic.png'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'A contemporary design with a sleek, minimalist style.',
    previewImage: '/templates/modern.png'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'A bold, eye-catching layout that showcases your personality.',
    previewImage: '/templates/creative.png'
  }
];

interface ResumeTemplatesProps {
  onSelectTemplate: (template: ResumeTemplate) => void;
  selectedTemplateId?: string;
}

export default function ResumeTemplates({ onSelectTemplate, selectedTemplateId = 'classic' }: ResumeTemplatesProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Select a Template</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all ${
              selectedTemplateId === template.id 
                ? 'ring-2 ring-primary' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                <img 
                  src={template.previewImage} 
                  alt={template.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Template+Preview';
                  }}
                />
              </div>
              <div>
                <h3 className="font-bold">{template.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
              </div>
              <Button 
                variant={selectedTemplateId === template.id ? "default" : "outline"} 
                className="w-full"
                onClick={() => onSelectTemplate(template)}
              >
                {selectedTemplateId === template.id ? 'Selected' : 'Select'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
