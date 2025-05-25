import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { z } from "zod";
import { UserRole } from "@shared/schema";
import { authenticate, authorizeEmployer, authorizeJobSeeker, generateToken, AuthRequest } from "./middleware/auth";
import { db } from './db';

// Zod schemas for validation
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
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
      startDate: z.date(),
      endDate: z.date().optional(),
      description: z.string().optional(),
    })),
    experience: z.array(z.object({
      company: z.string(),
      position: z.string(),
      location: z.string().optional(),
      startDate: z.date(),
      endDate: z.date().optional(),
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
      
      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email: userData.email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const newUser = {
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('users').insertOne(newUser);
      const user = { ...newUser, _id: result.insertedId };
      
      // Generate token
      const token = generateToken(user._id.toString(), user.role);
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });

  app.post('/api/auth/login', validateBody(loginSchema), async (req, res) => {
    try {
      const { email, password } = req.validatedBody;
      
      // Find user
      const user = await db.collection('users').findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Generate token
      const token = generateToken(user._id.toString(), user.role);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
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
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Ensure userId matches authenticated user
      if (resumeData.userId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only create resumes for yourself' });
      }
      
      const result = await db.collection('resumes').insertOne(resumeData);
      const resume = { ...resumeData, _id: result.insertedId };
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
      
      const resumes = await db.collection('resumes')
        .find({ userId: req.user._id.toString() })
        .toArray();
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
      
      const resume = await db.collection('resumes').findOne({ _id: req.params.id });
      
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      
      // Check if user owns the resume or is an employer viewing an application
      if (resume.userId !== req.user._id.toString() && req.user.role !== UserRole.EMPLOYER) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(resume);
    } catch (error) {
      console.error('Get resume error:', error);
      res.status(500).json({ message: 'Server error getting resume' });
    }
  });

  return httpServer;
}
