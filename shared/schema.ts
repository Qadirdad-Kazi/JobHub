// MongoDB Schemas and Types

// Analytics Types
export interface TrendDataPoint {
  date: string;
  count: number;
}

export interface JobAnalytics {
  jobId: string;
  title: string;
  totalApplications: number;
  viewCount: number;
  conversionRate: number;
  statusBreakdown: {
    pending: number;
    reviewed: number;
    interviewing: number;
    rejected: number;
    hired: number;
  };
  applicationTrend: TrendDataPoint[];
  averageTimeToHire: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployerAnalytics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  conversionRate: number;
  statusBreakdown: {
    pending: number;
    reviewed: number;
    interviewing: number;
    rejected: number;
    hired: number;
  };
  applicationTrend: TrendDataPoint[];
  jobPostingTrend: TrendDataPoint[];
}
export enum UserRole {
  JOBSEEKER = 'jobseeker',
  EMPLOYER = 'employer'
}

// Using a type alias to get the string literal union type
export type UserRoleType = keyof typeof UserRole;

export const JobType = {
  FULLTIME: "full-time",
  PARTTIME: "part-time",
  CONTRACT: "contract",
  INTERNSHIP: "internship",
  REMOTE: "remote",
} as const;

export const ApplicationStatus = {
  PENDING: "pending",
  REVIEWED: "reviewed",
  INTERVIEWING: "interviewing",
  REJECTED: "rejected",
  HIRED: "hired",
  WITHDRAWN: "withdrawn",
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export type User = {
  _id: string;
  email: string;
  name: string;
  username: string;
  role: UserRoleType;
  createdAt: Date;
  updatedAt: Date;
};

export interface Resume {
  _id?: string;
  userId: string;
  title: string;
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
      startDate: Date;
      endDate?: Date;
      description?: string;
    }>;
    experience: Array<{
      company: string;
      position: string;
      location?: string;
      startDate: Date;
      endDate?: Date;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Job {
  _id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  postedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
  status: 'active' | 'closed' | 'draft';
  viewCount?: number;
  clickCount?: number;
}

export type Application = {
  _id: string;
  jobId: string | Job;
  userId: string | User;
  resumeId: string | Resume;
  status: ApplicationStatus;
  coverLetter?: string;
  notes?: string;
  withdrawalReason?: string;
  withdrawnAt?: Date;
  appliedAt: Date;
  updatedAt: Date;
};

export interface Testimonial {
  _id?: string;
  userId: string;
  content: string;
  rating: number;
  createdAt: Date;
  isPublished: boolean;
}
