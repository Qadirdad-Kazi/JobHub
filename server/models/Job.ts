import mongoose from 'mongoose';
import { Job as JobType } from '@shared/schema';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  type: { 
    type: String, 
    required: true,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote']
  },
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' }
  },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  expiresAt: { type: Date },
}, {
  timestamps: true
});

// Add indexes for common search queries
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ postedBy: 1 });

const Job = mongoose.model<JobType>('Job', jobSchema);

export default Job; 