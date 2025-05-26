import nodemailer from 'nodemailer';
import { config } from '../config';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
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
    to: string,
    data: Parameters<typeof emailTemplates.applicationStatusUpdate>[0]
  ) {
    const { subject, text } = emailTemplates.applicationStatusUpdate(data);
    return transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
    });
  },

  async sendApplicationWithdrawnNotification(
    to: string,
    data: Parameters<typeof emailTemplates.applicationWithdrawn>[0]
  ) {
    const { subject, text } = emailTemplates.applicationWithdrawn(data);
    return transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
    });
  },

  async sendNewApplicationNotification(
    to: string,
    data: Parameters<typeof emailTemplates.newApplication>[0]
  ) {
    const { subject, text } = emailTemplates.newApplication(data);
    return transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
    });
  },
}; 