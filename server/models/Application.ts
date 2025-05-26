import mongoose from 'mongoose';
import { Application as ApplicationType } from '@shared/schema';

const applicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job',
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  resumeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Resume',
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  coverLetter: { type: String },
  notes: { type: String },
  appliedAt: { 
    type: Date,
    default: Date.now
  },
  updatedAt: { 
    type: Date,
    default: Date.now
  }
});

// Add indexes for common queries
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ userId: 1 });
applicationSchema.index({ status: 1 });

const Application = mongoose.model<ApplicationType>('Application', applicationSchema);

export default Application; 