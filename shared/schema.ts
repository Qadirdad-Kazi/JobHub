// MongoDB Schemas and Types
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
  INTERVIEW: "interview",
  REJECTED: "rejected",
  ACCEPTED: "accepted",
} as const;

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
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
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
}

export type Application = {
  _id: string;
  jobId: string | Job;
  userId: string | User;
  resumeId: string | Resume;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'withdrawn';
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
