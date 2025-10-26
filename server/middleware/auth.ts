import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { UserRole } from '../../shared/schema.js';
import User, { IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export function generateToken(userId: string, role: string): string {
  // Ensure role is lowercase to match UserRole enum values
  const normalizedRole = role.toLowerCase();
  // Use a hardcoded secret for development
  const secret = config.jwtSecret || 'jobhub_secure_jwt_secret_key_2025';
  console.log('Generating token for:', { userId, role: normalizedRole });
  return jwt.sign({ userId, role: normalizedRole }, secret, { expiresIn: '7d' });
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    // Use the same hardcoded secret for verification
    const secret = config.jwtSecret || 'jobhub_secure_jwt_secret_key_2025';
    const decoded = jwt.verify(token, secret) as { userId: string; role: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    next(error);
  }
}

export function authorizeJobSeeker(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  console.log('Authorizing job seeker. User role:', {
    actualRole: req.user.role,
    expectedRole: UserRole.JOBSEEKER,
    matches: req.user.role === UserRole.JOBSEEKER
  });

  if (req.user.role !== UserRole.JOBSEEKER) {
    return res.status(403).json({ message: 'Access denied. Job seeker role required.' });
  }

  next();
}

export function authorizeEmployer(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  console.log('Authorizing employer. User role:', {
    actualRole: req.user.role,
    expectedRole: UserRole.EMPLOYER,
    matches: req.user.role === UserRole.EMPLOYER
  });

  if (req.user.role !== UserRole.EMPLOYER) {
    return res.status(403).json({ message: 'Access denied. Employer role required.' });
  }

  next();
}
