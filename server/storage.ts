import { 
  users, User, InsertUser, 
  resumes, Resume, InsertResume,
  jobs, Job, InsertJob,
  applications, Application, InsertApplication,
  testimonials, Testimonial, InsertTestimonial,
} from "@shared/schema";

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Resume related methods
  createResume(resume: InsertResume): Promise<Resume>;
  getResume(id: number): Promise<Resume | undefined>;
  getResumesByUser(userId: number): Promise<Resume[]>;
  updateResume(id: number, resumeData: Partial<Resume>): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<boolean>;
  
  // Job related methods
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getJobsByEmployer(employerId: number): Promise<Job[]>;
  updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;
  searchJobs(query: string, location?: string, type?: string): Promise<Job[]>;
  
  // Application related methods
  createApplication(application: InsertApplication): Promise<Application>;
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByJob(jobId: number): Promise<Application[]>;
  getApplicationsByUser(userId: number): Promise<Application[]>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  
  // Testimonial related methods
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  private testimonials: Map<number, Testimonial>;
  
  private userId: number = 1;
  private resumeId: number = 1;
  private jobId: number = 1;
  private applicationId: number = 1;
  private testimonialId: number = 1;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.testimonials = new Map();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Resume methods
  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.resumeId++;
    const resume: Resume = { ...insertResume, id };
    this.resumes.set(id, resume);
    return resume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async getResumesByUser(userId: number): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(
      (resume) => resume.userId === userId
    );
  }

  async updateResume(id: number, resumeData: Partial<Resume>): Promise<Resume | undefined> {
    const resume = this.resumes.get(id);
    if (!resume) return undefined;
    
    const updatedResume = { ...resume, ...resumeData };
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }

  async deleteResume(id: number): Promise<boolean> {
    return this.resumes.delete(id);
  }

  // Job methods
  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.jobId++;
    const now = new Date();
    const job: Job = { 
      ...insertJob, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.jobs.set(id, job);
    return job;
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getJobsByEmployer(employerId: number): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.employerId === employerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { 
      ...job, 
      ...jobData, 
      updatedAt: new Date() 
    };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: number): Promise<boolean> {
    return this.jobs.delete(id);
  }

  async searchJobs(query: string, location?: string, type?: string): Promise<Job[]> {
    let results = Array.from(this.jobs.values());
    
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      results = results.filter(job => 
        job.title.toLowerCase().includes(lowercaseQuery) || 
        job.company.toLowerCase().includes(lowercaseQuery) ||
        job.description.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    if (location) {
      const lowercaseLocation = location.toLowerCase();
      results = results.filter(job => 
        job.location.toLowerCase().includes(lowercaseLocation)
      );
    }
    
    if (type) {
      results = results.filter(job => job.type === type);
    }
    
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Application methods
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.applicationId++;
    const now = new Date();
    const application: Application = { 
      ...insertApplication, 
      id, 
      appliedAt: now, 
      updatedAt: now 
    };
    this.applications.set(id, application);
    return application;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.jobId === jobId)
      .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.userId === userId)
      .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { 
      ...application, 
      status, 
      updatedAt: new Date() 
    };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Testimonial methods
  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialId++;
    const newTestimonial = {
      ...testimonial,
      id,
      createdAt: new Date()
    };
    this.testimonials.set(id, newTestimonial);
    return newTestimonial;
  }
}

export const storage = new MemStorage();
