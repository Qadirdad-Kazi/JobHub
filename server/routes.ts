import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { z } from "zod";
import { UserRole } from "@shared/schema";
import { authenticate, authorizeEmployer, authorizeJobSeeker, generateToken, AuthRequest } from "./middleware/auth";
import { db } from './db';
import User from './models/User';
import Resume from './models/Resume';
import Job from './models/Job';
import Application from './models/Application';
import { emailService } from './services/emailService';

// Zod schemas for validation
const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum([UserRole.JOBSEEKER, UserRole.EMPLOYER], {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const resumeSchema = z.object({
  userId: z.string(),
  title: z.string(),
  content: z.object({
    personalInfo: z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      location: z.string().optional(),
      website: z.string().url().optional(),
    }),
    education: z.array(z.object({
      school: z.string(),
      degree: z.string(),
      fieldOfStudy: z.string(),
      startDate: z.string().transform((str) => new Date(str)),
      endDate: z.string().transform((str) => new Date(str)).optional(),
      description: z.string().optional(),
    })),
    experience: z.array(z.object({
      company: z.string(),
      position: z.string(),
      location: z.string().optional(),
      startDate: z.string().transform((str) => new Date(str)),
      endDate: z.string().transform((str) => new Date(str)).optional(),
      description: z.string(),
    })),
    skills: z.array(z.string()),
    projects: z.array(z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      link: z.string().url().optional(),
    })).optional(),
  }),
});

// Job schema validation
const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  company: z.string().min(2, 'Company must be at least 2 characters'),
  location: z.string(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.array(z.string()),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('USD')
  }).optional(),
  status: z.enum(['active', 'closed', 'draft']).default('active'),
  expiresAt: z.date().optional()
});

const updateJobSchema = createJobSchema.partial();

const searchJobsSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10)
}).optional();

// Application schema validation
const createApplicationSchema = z.object({
  jobId: z.string(),
  resumeId: z.string(),
  coverLetter: z.string().optional(),
});

const updateApplicationSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']),
  notes: z.string().optional(),
});

// Add withdrawal schema after other schemas
const withdrawApplicationSchema = z.object({
  reason: z.string().optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Helper function to handle zod validation
  const validateBody = <T>(schema: z.ZodType<T>) => {
    return (req: any, res: any, next: any) => {
      try {
        req.validatedBody = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        next(error);
      }
    };
  };

  // Auth Routes
  app.post('/api/auth/register', validateBody(registerSchema), async (req, res) => {
    try {
      const { confirmPassword, ...userData } = req.validatedBody;
      
      // Create new user using Mongoose model
      const user = new User(userData);
      
      try {
        await user.save();
      
      // Generate token
        const token = generateToken(user._id.toString(), user.role);
      
      // Return user without password
        const userObject = user.toObject();
        const { password, ...userWithoutPassword } = userObject;
        
      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword,
        token
      });
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error
          const field = Object.keys(error.keyPattern)[0];
          return res.status(400).json({
            message: `User with this ${field} already exists`
          });
        }
        throw error;
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });

  app.post('/api/auth/login', validateBody(loginSchema), async (req, res) => {
    try {
      const { email, password } = req.validatedBody;
      
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Generate token
      const token = generateToken(user._id.toString(), user.role);
      
      // Return user without password
      const userObject = user.toObject();
      const { password: _, ...userWithoutPassword } = userObject;
      
      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  });

  app.get('/api/auth/me', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await db.collection('users').findOne({ _id: req.user._id });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Resume Routes
  app.post('/api/resumes', authenticate, authorizeJobSeeker, validateBody(resumeSchema), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const resumeData = {
        ...req.validatedBody,
        userId: req.user._id,
      };
      
      const resume = new Resume(resumeData);
      await resume.save();
      
      res.status(201).json(resume);
    } catch (error) {
      console.error('Create resume error:', error);
      res.status(500).json({ message: 'Server error creating resume' });
    }
  });

  app.get('/api/resumes', authenticate, authorizeJobSeeker, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const resumes = await Resume.find({ userId: req.user._id });
      res.json(resumes);
    } catch (error) {
      console.error('Get resumes error:', error);
      res.status(500).json({ message: 'Server error getting resumes' });
    }
  });

  app.get('/api/resumes/:id', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const resume = await Resume.findById(req.params.id);
      
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      
      // Check if user owns the resume or is an employer viewing an application
      if (!resume.userId.equals(req.user._id) && req.user.role !== UserRole.EMPLOYER) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(resume);
    } catch (error) {
      console.error('Get resume error:', error);
      res.status(500).json({ message: 'Server error getting resume' });
    }
  });

  // Job Routes
  app.post('/api/jobs', authenticate, authorizeEmployer, validateBody(createJobSchema), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const jobData = {
        ...req.validatedBody,
        postedBy: req.user._id
      };

      const job = new Job(jobData);
      await job.save();

      res.status(201).json(job);
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({ message: 'Server error creating job' });
    }
  });

  app.get('/api/jobs', validateBody(searchJobsSchema), async (req, res) => {
    try {
      const { query, location, type, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      // Build search criteria
      const searchCriteria: any = { status: 'active' };
      if (query) {
        searchCriteria.$text = { $search: query };
      }
      if (location) {
        searchCriteria.location = { $regex: location, $options: 'i' };
      }
      if (type) {
        searchCriteria.type = type;
      }

      // Execute search with pagination
      const jobs = await Job.find(searchCriteria)
        .populate('postedBy', 'name company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Job.countDocuments(searchCriteria);

      res.json({
        jobs,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Search jobs error:', error);
      res.status(500).json({ message: 'Server error searching jobs' });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const job = await Job.findById(req.params.id)
        .populate('postedBy', 'name company');
      
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      
      res.json(job);
    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({ message: 'Server error getting job' });
    }
  });

  app.put('/api/jobs/:id', authenticate, authorizeEmployer, validateBody(updateJobSchema), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const job = await Job.findOne({
        _id: req.params.id,
        postedBy: req.user._id
      });

      if (!job) {
        return res.status(404).json({ message: 'Job not found or unauthorized' });
      }

      Object.assign(job, req.validatedBody);
      await job.save();

      res.json(job);
    } catch (error) {
      console.error('Update job error:', error);
      res.status(500).json({ message: 'Server error updating job' });
    }
  });

  app.delete('/api/jobs/:id', authenticate, authorizeEmployer, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const job = await Job.findOneAndDelete({
        _id: req.params.id,
        postedBy: req.user._id
      });
      
      if (!job) {
        return res.status(404).json({ message: 'Job not found or unauthorized' });
      }

      res.json({ message: 'Job deleted successfully' });
    } catch (error) {
      console.error('Delete job error:', error);
      res.status(500).json({ message: 'Server error deleting job' });
    }
  });

  // Application Routes
  app.post('/api/applications', authenticate, authorizeJobSeeker, validateBody(createApplicationSchema), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { jobId, resumeId, coverLetter } = req.validatedBody;

      // Verify job exists and is active
      const job = await Job.findOne({ _id: jobId, status: 'active' })
        .populate('postedBy', 'name email company');
      if (!job) {
        return res.status(404).json({ message: 'Job not found or not active' });
      }
      
      // Verify resume belongs to user
      const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      
      // Get user details for email
      const applicant = await User.findById(req.user._id).select('name email');
      if (!applicant) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create application
      const application = new Application({
        jobId,
        userId: req.user._id,
        resumeId,
        coverLetter,
        appliedAt: new Date(),
        updatedAt: new Date()
      });

      await application.save();

      // Send email notification to employer
      await emailService.sendNewApplicationNotification(
        (job.postedBy as any).email,
        {
          employerName: (job.postedBy as any).name,
          applicantName: applicant.name,
          jobTitle: job.title
        }
      );

      // Populate response with job and resume details
      await application.populate([
        { path: 'jobId', select: 'title company' },
        { path: 'resumeId', select: 'title' }
      ]);

      res.status(201).json(application);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'You have already applied to this job' });
      }
      console.error('Create application error:', error);
      res.status(500).json({ message: 'Server error creating application' });
    }
  });

  // Get applications for a job (employer only)
  app.get('/api/jobs/:jobId/applications', authenticate, authorizeEmployer, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Verify job belongs to employer
      const job = await Job.findOne({ _id: req.params.jobId, postedBy: req.user._id });
      if (!job) {
        return res.status(404).json({ message: 'Job not found or unauthorized' });
      }

      const applications = await Application.find({ jobId: req.params.jobId })
        .populate([
          { path: 'userId', select: 'name email' },
          { path: 'resumeId', select: 'title content' }
        ])
        .sort({ appliedAt: -1 });

      res.json(applications);
    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({ message: 'Server error getting applications' });
    }
  });

  // Get my applications (job seeker only)
  app.get('/api/applications/me', authenticate, authorizeJobSeeker, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const applications = await Application.find({ userId: req.user._id })
        .populate([
          { 
            path: 'jobId',
            select: 'title company location type salary status',
            populate: { path: 'postedBy', select: 'name company' }
          },
          { path: 'resumeId', select: 'title' }
        ])
        .sort({ appliedAt: -1 });

      res.json(applications);
    } catch (error) {
      console.error('Get my applications error:', error);
      res.status(500).json({ message: 'Server error getting applications' });
    }
  });

  // Update application status (employer only)
  app.put('/api/applications/:id', authenticate, authorizeEmployer, validateBody(updateApplicationSchema), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { status, notes } = req.validatedBody;

      // Find application and verify job belongs to employer
      const application = await Application.findById(req.params.id)
        .populate([
          { path: 'jobId', populate: { path: 'postedBy', select: 'name email company' } },
          { path: 'userId', select: 'name email' }
        ]);

      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      // Type assertion since we know jobId is populated
      const job = application.jobId as any;
      if (!job.postedBy._id.equals(req.user._id)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Update application
      application.status = status;
      if (notes) application.notes = notes;
      application.updatedAt = new Date();

      await application.save();

      // Send email notification to applicant
      const applicant = application.userId as any;
      await emailService.sendApplicationStatusUpdate(
        applicant.email,
        {
          applicantName: applicant.name,
          jobTitle: job.title,
          company: job.postedBy.company,
          status,
          notes
        }
      );

      // Populate response
      await application.populate([
        { path: 'userId', select: 'name email' },
        { path: 'resumeId', select: 'title' },
        { 
          path: 'jobId',
          select: 'title company location type',
          populate: { path: 'postedBy', select: 'name company' }
        }
      ]);

      res.json(application);
    } catch (error) {
      console.error('Update application error:', error);
      res.status(500).json({ message: 'Server error updating application' });
    }
  });

  // Add withdrawal endpoint after other application endpoints
  app.post('/api/applications/:id/withdraw', authenticate, authorizeJobSeeker, validateBody(withdrawApplicationSchema), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const application = await Application.findOne({
        _id: req.params.id,
        userId: req.user._id,
        status: { $nin: ['withdrawn'] }
      }).populate([
        { path: 'jobId', populate: { path: 'postedBy', select: 'name email company' } },
        { path: 'userId', select: 'name email' }
      ]);

      if (!application) {
        return res.status(404).json({ message: 'Application not found or already withdrawn' });
      }

      const { reason } = req.validatedBody;

      // Update application status
      application.status = 'withdrawn';
      application.withdrawalReason = reason;
      application.withdrawnAt = new Date();
      application.updatedAt = new Date();

      await application.save();

      // Send email notification to employer
      const job = application.jobId as any;
      const employer = job.postedBy;
      const applicant = application.userId as any;

      await emailService.sendApplicationWithdrawnNotification(
        employer.email,
        {
          employerName: employer.name,
          applicantName: applicant.name,
          jobTitle: job.title,
          reason
        }
      );

      res.json(application);
    } catch (error) {
      console.error('Withdraw application error:', error);
      res.status(500).json({ message: 'Server error withdrawing application' });
    }
  });

  return httpServer;
}
