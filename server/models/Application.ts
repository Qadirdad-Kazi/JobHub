import mongoose from 'mongoose';
import { Application as ApplicationType } from '@shared/schema';

const applicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job',
    required: true,
    index: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  resumeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Resume',
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'interviewing', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
    index: true
  },
  coverLetter: { type: String },
  notes: { type: String },
  withdrawalReason: { type: String },
  withdrawnAt: { type: Date },
  appliedAt: { 
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: { 
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Add compound indexes for common queries
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ jobId: 1, appliedAt: -1 });

const Application = mongoose.model<ApplicationType>('Application', applicationSchema);

export default Application; 