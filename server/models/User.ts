import mongoose from 'mongoose';
import { UserRole } from '@shared/schema';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: [UserRole.JOBSEEKER, UserRole.EMPLOYER],
    required: true,
  },
  profileImage: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  skills: [{
    type: String,
  }],
  experience: [{
    type: String,
  }],
  education: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Add methods to compare password, etc.
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export interface IUser extends mongoose.Document {
  email: string;
  username: string;
  name: string;
  password: string;
  role: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  skills: string[];
  experience: string[];
  education: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const User = mongoose.model<IUser>('User', userSchema);

export default User; 