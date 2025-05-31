import nodemailer from 'nodemailer';
import { config } from '../config';

// Create a test account if in development
const createTestAccount = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.warn('Failed to create test email account, email notifications will be disabled');
      return null;
    }
  }
  return null;
};

// Initialize transporter
let transporter: nodemailer.Transporter | null = null;

// Initialize the transporter
createTestAccount().then(t => {
  transporter = t;
});

// Email templates
const emailTemplates = {
  applicationStatusUpdate: (data: {
    applicantName: string;
    jobTitle: string;
    company: string;
    status: string;
    notes?: string;
  }) => ({
    subject: `Application Status Update: ${data.jobTitle} at ${data.company}`,
    text: `
Dear ${data.applicantName},

Your application for the ${data.jobTitle} position at ${data.company} has been updated.

Status: ${data.status}
${data.notes ? `\nNotes: ${data.notes}` : ''}

Best regards,
CareerConnectPro Team
    `.trim(),
  }),

  applicationWithdrawn: (data: {
    employerName: string;
    applicantName: string;
    jobTitle: string;
    reason?: string;
  }) => ({
    subject: `Application Withdrawn: ${data.jobTitle}`,
    text: `
Dear ${data.employerName},

${data.applicantName} has withdrawn their application for the ${data.jobTitle} position.
${data.reason ? `\nReason provided: ${data.reason}` : ''}

Best regards,
CareerConnectPro Team
    `.trim(),
  }),

  newApplication: (data: {
    employerName: string;
    applicantName: string;
    jobTitle: string;
  }) => ({
    subject: `New Application Received: ${data.jobTitle}`,
    text: `
Dear ${data.employerName},

You have received a new application for the ${data.jobTitle} position from ${data.applicantName}.

You can review this application in your employer dashboard.

Best regards,
CareerConnectPro Team
    `.trim(),
  }),
};

export const emailService = {
  async sendApplicationStatusUpdate(
    applicantEmail: string,
    data: {
      applicantName: string;
      jobTitle: string;
      company: string;
      status: string;
      notes?: string;
    }
  ) {
    try {
      if (!transporter) {
        console.log('Email service not configured, skipping notification');
        return;
      }

      await transporter.sendMail({
        from: '"JobHub" <notifications@jobhub.com>',
        to: applicantEmail,
        subject: `Application Status Update: ${data.jobTitle}`,
        html: `
          <h1>Application Status Update</h1>
          <p>Dear ${data.applicantName},</p>
          <p>Your application for ${data.jobTitle} at ${data.company} has been updated to: ${data.status}</p>
          ${data.notes ? `<p>Notes: ${data.notes}</p>` : ''}
        `,
      });
    } catch (error) {
      console.warn('Failed to send email notification:', error);
      // Don't throw error, just log it
    }
  },

  async sendApplicationWithdrawnNotification(
    employerEmail: string,
    data: {
      employerName: string;
      applicantName: string;
      jobTitle: string;
      reason?: string;
    }
  ) {
    try {
      if (!transporter) {
        console.log('Email service not configured, skipping notification');
        return;
      }

      await transporter.sendMail({
        from: '"JobHub" <notifications@jobhub.com>',
        to: employerEmail,
        subject: `Application Withdrawn: ${data.jobTitle}`,
        html: `
          <h1>Application Withdrawn</h1>
          <p>Dear ${data.employerName},</p>
          <p>${data.applicantName} has withdrawn their application for ${data.jobTitle}.</p>
          ${data.reason ? `<p>Reason: ${data.reason}</p>` : ''}
        `,
      });
    } catch (error) {
      console.warn('Failed to send email notification:', error);
      // Don't throw error, just log it
    }
  },

  async sendNewApplicationNotification(
    employerEmail: string,
    data: {
      employerName: string;
      applicantName: string;
      jobTitle: string;
    }
  ) {
    try {
      if (!transporter) {
        console.log('Email service not configured, skipping notification');
        return;
      }

      await transporter.sendMail({
        from: '"JobHub" <notifications@jobhub.com>',
        to: employerEmail,
        subject: `New Application: ${data.jobTitle}`,
        html: `
          <h1>New Job Application</h1>
          <p>Dear ${data.employerName},</p>
          <p>${data.applicantName} has applied for the position of ${data.jobTitle}.</p>
          <p>Log in to your dashboard to review the application.</p>
        `,
      });
    } catch (error) {
      console.warn('Failed to send email notification:', error);
      // Don't throw error, just log it
    }
  },
}; 