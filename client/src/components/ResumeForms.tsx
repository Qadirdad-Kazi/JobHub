import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeData } from "@/lib/pdf";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  User, Mail, Phone, Home, Linkedin, Globe, 
  BookOpen, Briefcase, Hammer, ListChecks,
  PlusCircle, X, UserCircle
} from "lucide-react";

interface ResumeFormsProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().min(1, "Description is required"),
});

const educationSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  url: z.string().optional(),
  technologies: z.array(z.string()).optional(),
});

const resumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  contact: contactSchema,
  summary: z.string().optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(z.string()).optional(),
  projects: z.array(projectSchema).optional(),
  template: z.string(),
});

export function ResumeForms({ resumeData, setResumeData }: ResumeFormsProps) {
  const [activeSection, setActiveSection] = React.useState("personal");
  
  // Initialize the form with the provided resumeData
  const form = useForm<z.infer<typeof resumeSchema>>({
    resolver: zodResolver(resumeSchema),
    defaultValues: resumeData,
  });
  
  // Set up field arrays for repeatable sections
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = 
    useFieldArray({ control: form.control, name: "experience" });
  
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = 
    useFieldArray({ control: form.control, name: "education" });
  
  const { fields: projectFields, append: appendProject, remove: removeProject } = 
    useFieldArray({ control: form.control, name: "projects" });
  
  // Create a field array for skills (which are just strings)
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = 
    useFieldArray({ control: form.control, name: "skills" });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof resumeSchema>) => {
    setResumeData(data);
  };
  
  // Add empty skill
  const handleAddSkill = () => {
    appendSkill("");
  };
  
  // When any field changes, update the parent component's state
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      if (value) {
        setResumeData(value as ResumeData);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, setResumeData]);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="personal" className="flex items-center">
              <UserCircle className="mr-2 h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center">
              <ListChecks className="mr-2 h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center">
              <Hammer className="mr-2 h-4 w-4" />
              Projects
            </TabsTrigger>
          </TabsList>
          
          {/* Personal Section */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Add your personal details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resume Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Title</FormLabel>
                      <FormControl>
                        <Input placeholder="My Professional Resume" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Contact info section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <p className="text-sm text-gray-500">
                      This information will be displayed at the top of your resume.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contact.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                <User className="h-4 w-4" />
                              </span>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="John Doe" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contact.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                <Mail className="h-4 w-4" />
                              </span>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="johndoe@example.com" 
                                type="email"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contact.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                <Phone className="h-4 w-4" />
                              </span>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="(555) 123-4567" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contact.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                <Home className="h-4 w-4" />
                              </span>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="San Francisco, CA" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contact.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                <Linkedin className="h-4 w-4" />
                              </span>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="https://linkedin.com/in/username" 
                                {...field}
                                value={field.value || ''}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contact.website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                <Globe className="h-4 w-4" />
                              </span>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="https://example.com" 
                                {...field}
                                value={field.value || ''}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Summary section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Professional Summary</h3>
                    <p className="text-sm text-gray-500">
                      Write a short, compelling summary of your qualifications and goals.
                    </p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Experienced professional with a proven track record in..." 
                            className="min-h-[120px]"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Template Selection */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Resume Template</h3>
                    <p className="text-sm text-gray-500">
                      Choose a template for your resume.
                    </p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="template"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                          >
                            <div>
                              <RadioGroupItem
                                value="modern"
                                id="modern"
                                className="sr-only"
                              />
                              <Label
                                htmlFor="modern"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary cursor-pointer data-[state=checked]:border-primary"
                                data-state={field.value === "modern" ? "checked" : "unchecked"}
                              >
                                <div className="border rounded-md h-24 w-full bg-gray-50 mb-2 flex items-center justify-center">
                                  <div className="w-3/4 h-3/4 relative">
                                    <div className="absolute top-0 left-0 right-0 h-3 bg-primary"></div>
                                    <div className="absolute top-6 left-0 w-3/4 h-1 bg-gray-200"></div>
                                    <div className="absolute top-8 left-0 w-1/2 h-1 bg-gray-200"></div>
                                    <div className="absolute top-12 left-0 w-3/4 h-1 bg-gray-200"></div>
                                    <div className="absolute top-14 left-0 w-2/3 h-1 bg-gray-200"></div>
                                  </div>
                                </div>
                                <div className="text-center">Modern</div>
                              </Label>
                            </div>
                            
                            <div>
                              <RadioGroupItem
                                value="professional"
                                id="professional"
                                className="sr-only"
                              />
                              <Label
                                htmlFor="professional"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary cursor-pointer data-[state=checked]:border-primary"
                                data-state={field.value === "professional" ? "checked" : "unchecked"}
                              >
                                <div className="border rounded-md h-24 w-full bg-gray-50 mb-2 flex items-center justify-center">
                                  <div className="w-3/4 h-3/4 relative">
                                    <div className="absolute top-1 left-0 w-1/2 h-2 bg-gray-800"></div>
                                    <div className="absolute top-4 left-0 w-3/4 h-1 bg-gray-400"></div>
                                    <div className="absolute top-7 left-0 right-0 h-0.5 bg-gray-800"></div>
                                    <div className="absolute top-10 left-0 w-3/4 h-1 bg-gray-200"></div>
                                    <div className="absolute top-12 left-0 w-2/3 h-1 bg-gray-200"></div>
                                    <div className="absolute top-16 left-0 w-3/4 h-1 bg-gray-200"></div>
                                  </div>
                                </div>
                                <div className="text-center">Professional</div>
                              </Label>
                            </div>
                            
                            <div>
                              <RadioGroupItem
                                value="creative"
                                id="creative"
                                className="sr-only"
                              />
                              <Label
                                htmlFor="creative"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary cursor-pointer data-[state=checked]:border-primary"
                                data-state={field.value === "creative" ? "checked" : "unchecked"}
                              >
                                <div className="border rounded-md h-24 w-full bg-gray-50 mb-2 flex items-center justify-center">
                                  <div className="w-3/4 h-3/4 relative">
                                    <div className="absolute top-0 left-0 bottom-0 w-1/3 bg-purple-200"></div>
                                    <div className="absolute top-2 left-[35%] w-3/5 h-2 bg-gray-300"></div>
                                    <div className="absolute top-6 left-[35%] w-2/5 h-1 bg-gray-300"></div>
                                    <div className="absolute top-10 left-[35%] w-3/5 h-1 bg-purple-200"></div>
                                    <div className="absolute top-14 left-[35%] w-1/2 h-1 bg-gray-300"></div>
                                  </div>
                                </div>
                                <div className="text-center">Creative</div>
                              </Label>
                            </div>
                            
                            <div>
                              <RadioGroupItem
                                value="minimalist"
                                id="minimalist"
                                className="sr-only"
                              />
                              <Label
                                htmlFor="minimalist"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary cursor-pointer data-[state=checked]:border-primary"
                                data-state={field.value === "minimalist" ? "checked" : "unchecked"}
                              >
                                <div className="border rounded-md h-24 w-full bg-gray-50 mb-2 flex items-center justify-center">
                                  <div className="w-3/4 h-3/4 relative">
                                    <div className="absolute top-1 left-0 w-1/2 h-1.5 bg-gray-400"></div>
                                    <div className="absolute top-4 left-0 w-3/4 h-0.5 bg-gray-300"></div>
                                    <div className="absolute top-7 left-0 w-full h-[1px] bg-gray-200"></div>
                                    <div className="absolute top-10 left-0 w-3/4 h-0.5 bg-gray-300"></div>
                                    <div className="absolute top-12 left-0 w-2/3 h-0.5 bg-gray-300"></div>
                                    <div className="absolute top-16 left-0 w-3/4 h-0.5 bg-gray-300"></div>
                                  </div>
                                </div>
                                <div className="text-center">Minimalist</div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Experience Section */}
          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>
                  Add your work experience, starting with the most recent position.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {experienceFields.map((field, index) => (
                  <div key={field.id}>
                    {index > 0 && <Separator className="my-6" />}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Position {index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(index)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name={`experience.${index}.company`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Company Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`experience.${index}.position`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              <Input placeholder="Job Title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
                      <FormField
                        control={form.control}
                        name={`experience.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/YYYY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-end gap-4">
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`experience.${index}.endDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="MM/YYYY" 
                                    {...field} 
                                    value={field.value || ''}
                                    disabled={form.watch(`experience.${index}.current`)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`experience.${index}.current`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0 mt-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                              </FormControl>
                              <FormLabel className="text-sm">Current Position</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`experience.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your responsibilities and achievements..." 
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => appendExperience({
                    company: "",
                    position: "",
                    startDate: "",
                    endDate: "",
                    current: false,
                    description: ""
                  })}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Education Section */}
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>
                  Add your educational background, including degrees and certifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {educationFields.map((field, index) => (
                  <div key={field.id}>
                    {index > 0 && <Separator className="my-6" />}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Education {index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(index)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name={`education.${index}.institution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <FormControl>
                              <Input placeholder="University or School Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`education.${index}.degree`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Degree</FormLabel>
                            <FormControl>
                              <Input placeholder="Bachelor's, Master's, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`education.${index}.field`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field of Study</FormLabel>
                            <FormControl>
                              <Input placeholder="Computer Science, Business, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`education.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/YYYY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-end gap-4">
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`education.${index}.endDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="MM/YYYY" 
                                    {...field} 
                                    value={field.value || ''}
                                    disabled={form.watch(`education.${index}.current`)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`education.${index}.current`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0 mt-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                              </FormControl>
                              <FormLabel className="text-sm">Currently Studying</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`education.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional information, achievements, etc." 
                              className="min-h-[80px]"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => appendEducation({
                    institution: "",
                    degree: "",
                    field: "",
                    startDate: "",
                    endDate: "",
                    current: false,
                    description: ""
                  })}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Skills Section */}
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  Add your key skills and competencies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {skillFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`skills.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Skill" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleAddSkill}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Projects Section */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Add notable projects you've worked on.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {projectFields.map((field, index) => (
                  <div key={field.id}>
                    {index > 0 && <Separator className="my-6" />}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Project {index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProject(index)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name={`projects.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Project Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`projects.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project URL (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://project-url.com" 
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`projects.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the project, your role, and outcomes..." 
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="mt-4">
                      <FormLabel>Technologies Used (Optional)</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.watch(`projects.${index}.technologies`) && form.watch(`projects.${index}.technologies`).map((tech, techIndex) => (
                          <div key={techIndex} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                            <span>{tech}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 ml-1 p-0"
                              onClick={() => {
                                const technologies = form.getValues(`projects.${index}.technologies`) || [];
                                const newTechnologies = [...technologies];
                                newTechnologies.splice(techIndex, 1);
                                form.setValue(`projects.${index}.technologies`, newTechnologies);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <input
                          type="text"
                          className="flex-1 min-w-[150px] bg-transparent border-0 p-0 focus:ring-0 text-sm"
                          placeholder="Add technology..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              const target = e.target as HTMLInputElement;
                              const value = target.value.trim();
                              if (value) {
                                const technologies = form.getValues(`projects.${index}.technologies`) || [];
                                form.setValue(`projects.${index}.technologies`, [...technologies, value]);
                                target.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Type a technology name and press Enter or comma to add it
                      </p>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => appendProject({
                    name: "",
                    description: "",
                    url: "",
                    technologies: []
                  })}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
