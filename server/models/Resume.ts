import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    personalInfo: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: String,
      location: String,
      website: String,
    },
    education: [{
      school: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      fieldOfStudy: {
        type: String,
        required: true,
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: Date,
      description: String,
    }],
    experience: [{
      company: {
        type: String,
        required: true,
      },
      position: {
        type: String,
        required: true,
      },
      location: String,
      startDate: {
        type: Date,
        required: true,
      },
      endDate: Date,
      description: {
        type: String,
        required: true,
      },
    }],
    skills: [{
      type: String,
      required: true,
    }],
    projects: [{
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      technologies: [{
        type: String,
        required: true,
      }],
      link: String,
    }],
  },
}, {
  timestamps: true,
});

// Add index for userId for faster queries
resumeSchema.index({ userId: 1 });

export interface IResume extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const Resume = mongoose.model<IResume>('Resume', resumeSchema);

export default Resume; 