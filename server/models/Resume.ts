import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: {
    personalInfo: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      website?: string | null;
    };
    education: Array<{
      school?: string;
      degree?: string;
      fieldOfStudy?: string;
      startDate?: Date;
      endDate?: Date | null;
      description?: string;
    }>;
    experience: Array<{
      company?: string;
      position?: string;
      location?: string;
      startDate?: Date;
      endDate?: Date | null;
      description?: string;
    }>;
    skills: string[];
    projects: Array<{
      name?: string;
      description?: string;
      technologies?: string[];
      link?: string | null;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: false },
  content: {
    personalInfo: {
      name: { type: String, required: false },
      email: { type: String, required: false },
      phone: { type: String, required: false },
      location: { type: String, required: false },
      website: { type: String, required: false }
    },
    education: [{
      school: { type: String, required: false },
      degree: { type: String, required: false },
      fieldOfStudy: { type: String, required: false },
      startDate: { type: Date, required: false },
      endDate: { type: Date, required: false },
      description: { type: String, required: false }
    }],
    experience: [{
      company: { type: String, required: false },
      position: { type: String, required: false },
      location: { type: String, required: false },
      startDate: { type: Date, required: false },
      endDate: { type: Date, required: false },
      description: { type: String, required: false }
    }],
    skills: [{ type: String }],
    projects: [{
      name: { type: String, required: false },
      description: { type: String, required: false },
      technologies: [{ type: String }],
      link: { type: String, required: false }
    }]
  }
}, {
  timestamps: true
});

// Add index for userId for faster queries
ResumeSchema.index({ userId: 1 });

const Resume = mongoose.model<IResume>('Resume', ResumeSchema);

export default Resume; 