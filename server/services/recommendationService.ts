import mongoose from 'mongoose';
import Job from '../models/Job';
import User from '../models/User';
import { Job as JobType } from '@shared/schema';

/**
 * Service for generating job recommendations based on user skills and preferences
 */
export class RecommendationService {
  /**
   * Get personalized job recommendations for a user based on their skills and experience
   * @param userId The user ID to get recommendations for
   * @param limit The maximum number of recommendations to return
   * @returns Array of recommended jobs
   */
  static async getRecommendedJobs(userId: string, limit: number = 5): Promise<JobType[]> {
    try {
      // Get the user with their skills
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Extract user skills and experience for matching
      const userSkills = user.skills || [];
      const userLocation = user.location;
      
      // Base query for active jobs
      const baseQuery: any = { status: 'active' };
      
      // If we have skills to match, use them for recommendations
      let recommendedJobs: JobType[] = [];
      
      if (userSkills.length > 0) {
        // Find jobs that match user skills using text search on requirements and description
        const skillsQuery = userSkills.map(skill => `"${skill}"`).join(' ');
        
        // First attempt: Find jobs with exact skill matches in requirements
        const exactMatches = await Job.find({
          ...baseQuery,
          requirements: { $in: userSkills }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('postedBy', 'name company');
        
        recommendedJobs = exactMatches;
        
        // If we don't have enough exact matches, supplement with text search
        if (recommendedJobs.length < limit) {
          const textSearchLimit = limit - recommendedJobs.length;
          
          // Use text search on title, company, and description
          const textMatches = await Job.find({
            ...baseQuery,
            $text: { $search: skillsQuery },
            _id: { $nin: recommendedJobs.map(job => job._id) } // Exclude jobs we already found
          })
          .sort({ score: { $meta: 'textScore' } })
          .limit(textSearchLimit)
          .populate('postedBy', 'name company');
          
          recommendedJobs = [...recommendedJobs, ...textMatches];
        }
      }
      
      // If we still don't have enough recommendations or no skills were provided,
      // add location-based recommendations
      if (recommendedJobs.length < limit && userLocation) {
        const locationLimit = limit - recommendedJobs.length;
        
        const locationMatches = await Job.find({
          ...baseQuery,
          location: new RegExp(userLocation, 'i'),
          _id: { $nin: recommendedJobs.map(job => job._id) } // Exclude jobs we already found
        })
        .sort({ createdAt: -1 })
        .limit(locationLimit)
        .populate('postedBy', 'name company');
        
        recommendedJobs = [...recommendedJobs, ...locationMatches];
      }
      
      // If we still don't have enough, add recent jobs
      if (recommendedJobs.length < limit) {
        const recentLimit = limit - recommendedJobs.length;
        
        const recentJobs = await Job.find({
          ...baseQuery,
          _id: { $nin: recommendedJobs.map(job => job._id) } // Exclude jobs we already found
        })
        .sort({ createdAt: -1 })
        .limit(recentLimit)
        .populate('postedBy', 'name company');
        
        recommendedJobs = [...recommendedJobs, ...recentJobs];
      }
      
      return recommendedJobs;
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      throw error;
    }
  }
}

export default RecommendationService;
