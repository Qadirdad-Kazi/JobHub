import { Application } from '@shared/schema';
import { api } from '../lib/api';

export const applicationService = {
  async getMyApplications(): Promise<Application[]> {
    const response = await api.get('/api/applications/me');
    return response.data;
  },

  async getJobApplications(jobId: string): Promise<Application[]> {
    const response = await api.get(`/api/jobs/${jobId}/applications`);
    return response.data;
  },

  async createApplication(data: {
    jobId: string;
    resumeId: string;
    coverLetter?: string;
  }): Promise<Application> {
    const response = await api.post('/api/applications', data);
    return response.data;
  },

  async updateApplicationStatus(applicationId: string, data: {
    status: Application['status'];
    notes?: string;
  }): Promise<Application> {
    const response = await api.put(`/api/applications/${applicationId}`, data);
    return response.data;
  },

  async withdrawApplication(applicationId: string, data: {
    reason?: string;
  }): Promise<Application> {
    const response = await api.post(`/api/applications/${applicationId}/withdraw`, data);
    return response.data;
  },

  async deleteApplication(applicationId: string): Promise<void> {
    await api.delete(`/api/applications/${applicationId}`);
  },

  async updateApplication(applicationId: string, data: {
    coverLetter?: string;
    notes?: string;
  }): Promise<Application> {
    const response = await api.put(`/api/applications/${applicationId}/edit`, data);
    return response.data;
  }
}; 