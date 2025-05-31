import type { Express, Request, Response, NextFunction } from "express";
import mongoose, { Types } from "mongoose";
import User, { IUser } from "./models/User";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { z } from "zod";
import { UserRole } from "@shared/schema";
import { authenticate, authorizeEmployer, authorizeJobSeeker, generateToken, AuthRequest } from './middleware/auth';
import { db } from './db';
import Resume from './models/Resume';
import Job from './models/Job';
import Application from './models/Application';
import { emailService } from './services/emailService';
import RecommendationService from './services/recommendationService';
import AnalyticsService from './services/analyticsService';

// Zod schemas for validation
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  // Support both name and firstName/lastName patterns
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum([UserRole.JOBSEEKER, UserRole.EMPLOYER], {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
})
// Ensure either name is provided or both firstName and lastName are provided
.refine(data => {
  if (data.name) return true;
  return !!(data.firstName && data.lastName);
}, {
  message: "Either name or both firstName and lastName must be provided",
  path: ["name"],
})
// Ensure passwords match
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const resumeSchema = z.object({
  title: z.string().optional(),
  content: z.object({
    personalInfo: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      website: z.string().url().optional().nullable(),
    }),
    education: z.array(z.object({
      school: z.string().optional(),
      degree: z.string().optional(),
      fieldOfStudy: z.string().optional(),
      startDate: z.string().optional().transform(str => str ? new Date(str) : new Date()),
      endDate: z.string().optional().nullable().transform(str => str ? new Date(str) : null),
      description: z.string().optional(),
    })).optional().default([]),
    experience: z.array(z.object({
      company: z.string().optional(),
      position: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string().optional().transform(str => str ? new Date(str) : new Date()),
      endDate: z.string().optional().nullable().transform(str => str ? new Date(str) : null),
      description: z.string().optional(),
    })).optional().default([]),
    skills: z.array(z.string()).optional().default([]),
    projects: z.array(z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      technologies: z.array(z.string()).optional().default([]),
      link: z.string().url().optional().nullable(),
    })).optional().default([]),
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
  status: z.enum(['pending', 'reviewed', 'interviewing', 'rejected', 'hired', 'withdrawn']),
  notes: z.string().optional(),
});

// Add withdrawal schema after other schemas
const withdrawApplicationSchema = z.object({
  reason: z.string().optional()
});

// Extend the AuthRequest interface to include validatedBody
interface ValidatedRequest<T> extends AuthRequest {
  validatedBody: T;
}

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Helper function to handle zod validation
  const validateBody = <T>(schema: z.ZodType<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Parse and validate the request body
        const validatedData = schema.parse(req.body);
        // Safely assign the validated data to the request object
        (req as ValidatedRequest<T>).validatedBody = validatedData;
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
  app.post('/api/auth/register', async (req: Request, res) => {
    try {
      // Log the incoming request body
      console.log('Register request body:', req.body);
      
      // Validate the request body using Zod schema
      let userData; // Declare userData variable at the outer scope
      
      try {
        const validationResult = registerSchema.safeParse(req.body);
        
        if (!validationResult.success) {
          console.error('Validation errors:', validationResult.error.format());
          return res.status(400).json({
            message: 'Validation failed',
            errors: validationResult.error.format()
          });
        }
        
        const validatedData = validationResult.data;
        console.log('Validated data:', { ...validatedData, password: '******' });
        
        // Ensure name is properly formatted by combining firstName and lastName if needed
        let formattedName = validatedData.name;
        if (!formattedName && validatedData.firstName && validatedData.lastName) {
          formattedName = `${validatedData.firstName} ${validatedData.lastName}`;
        }
        
        if (!formattedName || formattedName.length < 2) {
          console.error('Name validation failed:', { formattedName });
          return res.status(400).json({ message: 'Name must be at least 2 characters long' });
        }
        
        // Create user data object with validated fields
        userData = {
          email: validatedData.email,
          username: validatedData.username,
          password: validatedData.password,
          role: validatedData.role,
          name: formattedName,
        };
        
        console.log('User data to save:', { 
          ...userData, 
          password: '******',
          roleType: typeof userData.role,
          roleValue: userData.role,
          nameLength: formattedName.length
        });
      } catch (validationError: any) {
        console.error('Error during validation:', validationError);
        return res.status(400).json({
          message: 'Invalid request data',
          error: validationError.message
        });
      }
      
      // Ensure userData is defined before continuing
      if (!userData) {
        console.error('User data is undefined after validation');
        return res.status(500).json({ message: 'Server error during validation' });
      }
      
      // Create new user using Mongoose model
      const user = new User(userData);
      
      try {
        console.log('Attempting to save user:', { ...userData, password: '******' });
        
        // Validate the user model before saving
        const validationError = user.validateSync();
        if (validationError) {
          console.error('Validation error before save:', validationError);
          return res.status(400).json({
            message: 'Validation failed',
            errors: Object.keys(validationError.errors || {}).reduce((acc: any, key) => {
              acc[key] = validationError.errors[key].message;
              return acc;
            }, {})
          });
        }
        
        // Save the user to the database
        await user.save();
        console.log('User saved successfully with ID:', user._id);
      
        // Generate token
        // Add type assertion to handle the unknown type
        const token = generateToken((user._id as any).toString(), user.role);
        console.log('Token generated successfully');
      
        // Return user without password and transform to match frontend expectations
        const userObject = user.toObject();
        console.log('User object created:', { id: userObject._id, email: userObject.email });
        const { password, _id, name, ...otherUserFields } = userObject;
        
        // Split name into firstName and lastName for frontend
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Create user object that matches frontend expectations
        const transformedUser = {
          ...otherUserFields,
          id: (_id as Types.ObjectId).toString(),
          firstName,
          lastName
        };
        
        console.log('Transformed user ready for response');
        
        res.status(201).json({
          message: 'User registered successfully',
          user: transformedUser,
          token
        });
      } catch (error: any) {
        console.error('Error saving user:', error);
        console.error('Error details:', { 
          message: error.message, 
          code: error.code, 
          name: error.name,
          stack: error.stack
        });
        
        if (error.code === 11000) {
          // Duplicate key error
          const field = Object.keys(error.keyPattern || {})[0] || 'unknown field';
          console.error(`Duplicate key error for field: ${field}`);
          return res.status(400).json({
            message: `User with this ${field} already exists`,
            field: field
          });
        }
        
        if (error.name === 'ValidationError') {
          // Mongoose validation error
          const validationErrors = Object.keys(error.errors || {}).reduce((acc: any, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {});
          
          console.error('Validation errors:', validationErrors);
          return res.status(400).json({
            message: 'Validation failed',
            errors: validationErrors
          });
        }
        
        // Return detailed error information
        return res.status(500).json({
          message: error.message || 'Error creating user',
          error: error.toString()
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });

  app.post('/api/auth/login', validateBody(loginSchema), async (req: Request, res) => {
    try {
      // Safely access the validated body
      const validatedBody = (req as ValidatedRequest<z.infer<typeof loginSchema>>).validatedBody;
      const { email, password } = validatedBody;
      
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
      // Add type assertion to handle the unknown type
      const token = generateToken((user._id as any).toString(), user.role);
      
      // Return user without password and transform to match frontend expectations
      const userObject = user.toObject();
      const { password: _, _id, name, ...otherUserFields } = userObject;
      
      // Split name into firstName and lastName for frontend
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Create user object that matches frontend expectations
      const transformedUser = {
        ...otherUserFields,
        id: (_id as Types.ObjectId).toString(),
        firstName,
        lastName
      };
      
      res.json({
        user: transformedUser,
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
      
      // Find the user without returning the password
      const user = await User.findById(req.user._id).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Transform the user object to match frontend expectations
      const userObject = user.toObject();
      const { password, _id, ...userData } = userObject;
      
      const transformedUser = {
        ...userData,
        id: (_id as Types.ObjectId).toString()
      };
      
      res.json(transformedUser);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Server error fetching user profile' });
    }
  });

  // Update user profile
  app.put('/api/auth/profile', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { name, bio, location, skills } = req.body;

      // Find and update the user
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update fields if provided
      if (name) user.name = name;
      if (bio !== undefined) user.bio = bio;
      if (location !== undefined) user.location = location;
      if (skills) user.skills = skills;

      user.updatedAt = new Date();
      await user.save();

      // Return updated user without password
      const userObject = user.toObject();
      const { password, _id, ...userData } = userObject;
      
      const transformedUser = {
        ...userData,
        id: (_id as Types.ObjectId).toString()
      };

      res.json(transformedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Server error updating profile' });
    }
  });

  // Stats endpoint - should be before other routes since it's a public endpoint
  app.get('/api/stats', async (_req: Request, res: Response) => {
    try {
      // Get total jobs count
      const totalJobs = await Job.countDocuments({ status: 'active' });
      
      // Get total companies (unique employers)
      const totalCompanies = await User.countDocuments({ role: UserRole.EMPLOYER });
      
      // Get total job seekers
      const totalJobSeekers = await User.countDocuments({ role: UserRole.JOBSEEKER });
      
      res.json({
        totalJobs,
        totalCompanies,
        totalJobSeekers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  // Resume Routes
  app.post('/api/resumes', authenticate, authorizeJobSeeker, validateBody(resumeSchema as any), async (req: AuthRequest, res) => {
    // Type assertion to access validatedBody
    const validatedReq = req as ValidatedRequest<z.infer<typeof resumeSchema>>;
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Add current date for any missing dates
      const now = new Date();
      const resumeData = {
        ...validatedReq.validatedBody,
        userId: req.user._id,
        content: {
          ...validatedReq.validatedBody.content,
          education: validatedReq.validatedBody.content.education?.map(edu => ({
            ...edu,
            startDate: edu.startDate || now,
            endDate: edu.endDate || null
          })) || [],
          experience: validatedReq.validatedBody.content.experience?.map(exp => ({
            ...exp,
            startDate: exp.startDate || now,
            endDate: exp.endDate || null
          })) || []
        }
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
      // Use type assertion to handle the unknown type
      const userId = req.user._id as string;
      const resumeUserId = resume.userId.toString();
      
      if (userId !== resumeUserId && req.user.role !== UserRole.EMPLOYER) {
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
    // Type assertion to access validatedBody
    const validatedReq = req as ValidatedRequest<z.infer<typeof createJobSchema>>;
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const jobData = {
        ...validatedReq.validatedBody,
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

  app.get('/api/jobs', async (req: Request, res) => {
    try {
      // Simple approach - just fetch all jobs without complex filtering
      // We can add filtering back once the basic endpoint is working
      
      // Execute search without pagination
      const jobs = await Job.find()
        .populate('postedBy', 'name company')
        .sort({ createdAt: -1 });
        
      // Return all jobs without pagination for now
      return res.json({
        jobs,
        pagination: {
          total: jobs.length,
          page: 1,
          pages: 1
        }
      });
    } catch (error) {
      console.error('Search jobs error:', error);
      // Provide more detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      console.error('Error details:', { message: errorMessage, stack: errorStack });
      res.status(500).json({ 
        message: 'Server error searching jobs',
        error: errorMessage
      });
    }
  });

  app.get('/api/jobs/:id', async (req: Request, res) => {
    try {
      const { id } = req.params;
      
      // Check if the ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log(`Invalid job ID format: ${id}`);
        return res.status(400).json({ message: 'Invalid job ID format' });
      }
      
      const job = await Job.findById(id)
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
    // Type assertion to access validatedBody
    const validatedReq = req as ValidatedRequest<z.infer<typeof updateJobSchema>>;
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

      Object.assign(job, validatedReq.validatedBody);
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
      
      // Safely access the validated body
      const validatedBody = (req as ValidatedRequest<z.infer<typeof createApplicationSchema>>).validatedBody;
      const { jobId, resumeId, coverLetter } = validatedBody;

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
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
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

  // Get user's applications
  app.get('/api/applications/me', authenticate, authorizeJobSeeker, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // Find all applications for this user with proper population
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
      console.error('Error fetching user applications:', error);
      res.status(500).json({ message: 'Server error fetching applications' });
    }
  });

  // Update application status (employer only)
  app.put('/api/applications/:id', authenticate, authorizeEmployer, validateBody(updateApplicationSchema), async (req: AuthRequest, res) => {
    // Type assertion to access validatedBody
    const validatedReq = req as ValidatedRequest<z.infer<typeof updateApplicationSchema>>;
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { status, notes } = validatedReq.validatedBody;

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

      // Safely access the validated body
      const validatedBody = (req as ValidatedRequest<z.infer<typeof withdrawApplicationSchema>>).validatedBody;
      const { reason } = validatedBody;

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

  // Job Recommendations API
  app.get('/api/recommendations', authenticate, authorizeJobSeeker, async (req: AuthRequest, res) => {
    try {
      // Ensure user exists before proceeding
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }
      
      // Safely access the user ID with proper type handling
      // Using the IUser interface for proper typing
      if (!req.user || !req.user._id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user data'
        });
      }
      const userId = req.user._id.toString();
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const recommendations = await RecommendationService.getRecommendedJobs(userId, limit);
      
      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get job recommendations'
      });
    }
  });

  // Job Analytics API
  app.get('/api/analytics/jobs/:jobId', authenticate, authorizeEmployer, async (req: AuthRequest, res) => {
    try {
      const { jobId } = req.params;
      
      // Verify the job belongs to this employer
      const job = await Job.findOne({ _id: jobId, postedBy: req.user!._id });
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or you do not have permission to view analytics'
        });
      }
      
      const analytics = await AnalyticsService.getJobAnalytics(jobId);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting job analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get job analytics'
      });
    }
  });

  // Employer Dashboard Analytics API
  app.get('/api/analytics/employer', authenticate, authorizeEmployer, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // Use type assertion to inform TypeScript that _id exists and is a mongoose ObjectId
      const employerId = req.user._id?.toString() || '';
      
      const analytics = await AnalyticsService.getEmployerAnalytics(employerId);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting employer analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get employer analytics'
      });
    }
  });

  // Get user's saved jobs
  app.get('/api/jobs/saved', authenticate, authorizeJobSeeker, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // For now, return an empty array since the saved jobs feature is not implemented yet
      // In the future, this would query a SavedJob model or similar
      res.json([]);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      res.status(500).json({ message: 'Server error fetching saved jobs' });
    }
  });

  // Get employer profile data
  app.get('/api/employer', authenticate, authorizeEmployer, async (req: AuthRequest, res) => {
    try {
      console.log('Employer endpoint accessed, headers:', req.headers);
      console.log('Auth header:', req.headers.authorization);
      
      if (!req.user) {
        console.log('No user found in request');
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      console.log('User authenticated:', req.user._id, req.user.role);
      const employerId = req.user._id;
      
      // Find the employer user with their jobs count
      const employer = await User.findById(employerId).select('-password');
      
      if (!employer) {
        return res.status(404).json({ message: 'Employer not found' });
      }
      
      // Get employer's jobs count
      const jobsCount = await Job.countDocuments({ postedBy: employerId });
      
      // Get active jobs count
      const activeJobsCount = await Job.countDocuments({ 
        postedBy: employerId,
        $or: [{ status: { $exists: false } }, { status: 'active' }, { status: 'Active' }]
      });
      
      // Get applications count for employer's jobs
      const applications = await Application.find({ job: { $in: await Job.find({ postedBy: employerId }).select('_id') } });
      
      res.json({
        success: true,
        data: {
          employer,
          stats: {
            totalJobs: jobsCount,
            activeJobs: activeJobsCount,
            totalApplications: applications.length,
            interviewsScheduled: applications.filter(app => String(app.status) === 'reviewed').length,
            positionsFilled: applications.filter(app => String(app.status) === 'accepted').length
          }
        }
      });
    } catch (error) {
      console.error('Error fetching employer data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employer data'
      });
    }
  });

  // Track job view
  app.post('/api/jobs/:jobId/view', async (req, res) => {
    try {
      const { jobId } = req.params;
      
      // Increment view count
      await Job.findByIdAndUpdate(jobId, { $inc: { viewCount: 1 } });
      
      res.json({
        success: true
      });
    } catch (error) {
      console.error('Error tracking job view:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track job view'
      });
    }
  });

  return createServer(app);
}
