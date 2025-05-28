import mongoose from 'mongoose';
import Job from '../models/Job';
import Application from '../models/Application';
import { JobAnalytics, ApplicationStatus, EmployerAnalytics, TrendDataPoint } from '@shared/schema';

/**
 * Service for generating analytics data for employers
 */
export class AnalyticsService {
  /**
   * Get analytics for a specific job posting
   * @param jobId The job ID to get analytics for
   * @returns Job analytics data
   */
  static async getJobAnalytics(jobId: string): Promise<JobAnalytics> {
    try {
      const job = await Job.findById(jobId);
      
      if (!job) {
        throw new Error('Job not found');
      }
      
      // Get all applications for this job
      const applications = await Application.find({ job: jobId });
      
      // Calculate application metrics
      const totalApplications = applications.length;
      const viewCount = (job as any).viewCount || 0;
      
      // Calculate application status breakdown
      const statusCounts = {
        pending: 0,
        reviewed: 0,
        interviewing: 0,
        rejected: 0,
        hired: 0
      };
      
      applications.forEach(app => {
        if (app.status in statusCounts) {
          statusCounts[app.status as ApplicationStatus]++;
        }
      });
      
      // Calculate conversion rate (applications / views)
      const conversionRate = viewCount > 0 ? (totalApplications / viewCount) * 100 : 0;
      
      // Get application trend (applications per day for the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const applicationTrend = await Application.aggregate([
        { 
          $match: { 
            job: new mongoose.Types.ObjectId(jobId),
            createdAt: { $gte: thirtyDaysAgo }
          } 
        },
        {
          $group: {
            _id: { 
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } 
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      // Format the trend data
      const trendData = applicationTrend.map(item => ({
        date: item._id,
        count: item.count
      }));
      
      return {
        jobId: job._id.toString(),
        title: job.title,
        totalApplications,
        viewCount,
        conversionRate,
        statusBreakdown: statusCounts,
        applicationTrend: trendData,
        averageTimeToHire: 0, // This would require more complex calculation
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      };
    } catch (error) {
      console.error('Error getting job analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get aggregated analytics for all jobs posted by an employer
   * @param employerId The employer user ID
   * @returns Aggregated analytics data
   */
  static async getEmployerAnalytics(employerId: string) {
    try {
      // Get all active jobs for this employer
      const jobs = await Job.find({ postedBy: employerId });
      const jobIds = jobs.map(job => job._id);
      
      // Get total view count across all jobs
      const totalViews = jobs.reduce((sum, job) => sum + ((job as any).viewCount || 0), 0);
      
      // Get all applications for this employer's jobs
      const applications = await Application.find({ job: { $in: jobIds } });
      
      // Calculate total applications
      const totalApplications = applications.length;
      
      // Calculate application status breakdown
      const statusCounts = {
        pending: 0,
        reviewed: 0,
        interviewing: 0,
        rejected: 0,
        hired: 0
      };
      
      applications.forEach(app => {
        if (app.status in statusCounts) {
          statusCounts[app.status as ApplicationStatus]++;
        }
      });
      
      // Get application trend (applications per day for the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const applicationTrend = await Application.aggregate([
        { 
          $match: { 
            job: { $in: jobIds },
            createdAt: { $gte: thirtyDaysAgo }
          } 
        },
        {
          $group: {
            _id: { 
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } 
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      // Get job posting trend
      const jobPostingTrend = await Job.aggregate([
        { 
          $match: { 
            postedBy: new mongoose.Types.ObjectId(employerId),
            createdAt: { $gte: thirtyDaysAgo }
          } 
        },
        {
          $group: {
            _id: { 
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } 
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      return {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === 'active').length,
        totalApplications,
        totalViews,
        conversionRate: totalViews > 0 ? (totalApplications / totalViews) * 100 : 0,
        statusBreakdown: statusCounts,
        applicationTrend: applicationTrend.map(item => ({
          date: item._id,
          count: item.count
        })),
        jobPostingTrend: jobPostingTrend.map(item => ({
          date: item._id,
          count: item.count
        }))
      };
    } catch (error) {
      console.error('Error getting employer analytics:', error);
      throw error;
    }
  }
}

export default AnalyticsService;
