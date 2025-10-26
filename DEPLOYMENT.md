# JobHub Deployment Guide

This guide will help you deploy the JobHub application with the frontend on Netlify and the backend on Vercel.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or other MongoDB hosting)
- Netlify account
- Vercel account
- Git repository (GitHub, GitLab, or Bitbucket)

## Backend Deployment (Vercel)

### 1. Prepare MongoDB Database

1. Create a MongoDB Atlas cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with read/write permissions
3. Whitelist all IP addresses (0.0.0.0/0) for Vercel's serverless functions
4. Copy your MongoDB connection string

### 2. Deploy to Vercel

1. **Push your code to a Git repository** (if not already done)

2. **Import your project to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables:**
   
   In the Vercel dashboard, add these environment variables:
   
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobhub?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS
   CLIENT_URL=https://your-frontend-url.netlify.app
   BCRYPT_SALT_ROUNDS=10
   ```
   
   Optional email configuration (for notifications):
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   EMAIL_FROM=noreply@jobhub.com
   ```

4. **Generate JWT Secret:**
   ```bash
   # Use one of these methods to generate a secure JWT secret:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   # OR
   openssl rand -base64 64
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

### 3. Update Backend CORS Settings

Once deployed, note your Vercel backend URL. You'll use this in the frontend configuration.

## Frontend Deployment (Netlify)

### 1. Configure Environment Variables

1. Create a `.env` file in the `client` directory (for local development):
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   VITE_APP_NAME=JobHub
   VITE_APP_VERSION=1.0.0
   VITE_APP_ENVIRONMENT=production
   VITE_ENABLE_ANALYTICS=false
   VITE_ENABLE_NOTIFICATIONS=true
   ```

### 2. Deploy to Netlify

#### Option A: Using Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy from the client directory:**
   ```bash
   cd client
   netlify deploy --prod
   ```

4. **Set environment variables:**
   ```bash
   netlify env:set VITE_API_URL "https://your-backend-url.vercel.app/api"
   netlify env:set VITE_APP_NAME "JobHub"
   netlify env:set VITE_APP_VERSION "1.0.0"
   netlify env:set VITE_APP_ENVIRONMENT "production"
   ```

#### Option B: Using Netlify Dashboard

1. **Connect your repository:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to your Git provider and select your repository

2. **Configure build settings:**
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
   - Node version: 18

3. **Add environment variables:**
   Go to Site settings → Environment variables and add:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   VITE_APP_NAME=JobHub
   VITE_APP_VERSION=1.0.0
   VITE_APP_ENVIRONMENT=production
   VITE_ENABLE_ANALYTICS=false
   VITE_ENABLE_NOTIFICATIONS=true
   ```

4. **Deploy:**
   - Click "Deploy site"
   - Wait for the build to complete
   - Copy your Netlify URL

### 3. Update Backend CORS

After getting your Netlify URL:

1. Go back to your Vercel dashboard
2. Update the `CLIENT_URL` environment variable with your Netlify URL
3. Redeploy the backend for changes to take effect

## Post-Deployment Steps

### 1. Test the Deployment

1. **Test Registration:**
   - Go to your Netlify URL
   - Create a new account (both Job Seeker and Employer)
   - Verify you can log in

2. **Test Job Posting (Employer):**
   - Log in as an employer
   - Try creating a job posting
   - Verify it appears in the jobs list

3. **Test Applications (Job Seeker):**
   - Log in as a job seeker
   - Create a resume
   - Apply to a job
   - Check application status

### 2. Monitor and Debug

- **Vercel Logs:** Check runtime logs in Vercel dashboard
- **Netlify Logs:** Check build and function logs in Netlify dashboard
- **Browser Console:** Check for any API errors

### 3. Custom Domain (Optional)

#### For Netlify (Frontend):
1. Go to Domain settings in Netlify
2. Add your custom domain
3. Configure DNS records as instructed

#### For Vercel (Backend):
1. Go to Settings → Domains in Vercel
2. Add your custom domain for API
3. Update `VITE_API_URL` in Netlify environment variables

## Troubleshooting

### CORS Issues
- Ensure `CLIENT_URL` in Vercel matches your Netlify URL exactly
- Check that the backend CORS configuration allows your frontend domain

### Database Connection Issues
- Verify MongoDB connection string is correct
- Ensure IP whitelist includes 0.0.0.0/0 in MongoDB Atlas
- Check database user permissions

### Build Failures

**Frontend:**
- Clear Netlify cache and retry
- Check Node.js version (should be 18+)
- Verify all environment variables are set

**Backend:**
- Check Vercel build logs for errors
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation succeeds

### API Not Working
- Check that `VITE_API_URL` includes `/api` at the end
- Verify backend is deployed and running on Vercel
- Check browser network tab for API request URLs

## Environment Variables Reference

### Backend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Yes | Secret key for JWT tokens | `random-64-char-string` |
| `CLIENT_URL` | Yes | Frontend URL for CORS | `https://app.netlify.app` |
| `PORT` | No | Server port (not used in Vercel) | `3001` |
| `BCRYPT_SALT_ROUNDS` | No | Password hashing rounds | `10` |
| `EMAIL_HOST` | No | SMTP host for emails | `smtp.gmail.com` |
| `EMAIL_PORT` | No | SMTP port | `587` |
| `EMAIL_SECURE` | No | Use TLS | `false` |
| `EMAIL_USER` | No | Email account username | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | No | Email account password | `app-password` |
| `EMAIL_FROM` | No | From email address | `noreply@jobhub.com` |

### Frontend (Netlify)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API URL | `https://api.vercel.app/api` |
| `VITE_APP_NAME` | No | Application name | `JobHub` |
| `VITE_APP_VERSION` | No | Application version | `1.0.0` |
| `VITE_APP_ENVIRONMENT` | No | Environment | `production` |
| `VITE_ENABLE_ANALYTICS` | No | Enable analytics | `false` |
| `VITE_ENABLE_NOTIFICATIONS` | No | Enable notifications | `true` |

## Continuous Deployment

Both Netlify and Vercel automatically deploy when you push to your Git repository:

- **Netlify:** Monitors your repository and redeploys the frontend on push
- **Vercel:** Monitors your repository and redeploys the backend on push

To disable auto-deployment, configure it in each platform's settings.

## Security Best Practices

1. **Never commit `.env` files** to your repository
2. **Use strong JWT secrets** (64+ random characters)
3. **Enable HTTPS** on both frontend and backend (automatic with Netlify/Vercel)
4. **Regularly update dependencies** for security patches
5. **Use environment variables** for all sensitive data
6. **Implement rate limiting** on API endpoints (already configured)
7. **Monitor logs** for suspicious activity

## Support

For issues specific to:
- **Netlify:** Check [Netlify Documentation](https://docs.netlify.com/)
- **Vercel:** Check [Vercel Documentation](https://vercel.com/docs)
- **MongoDB Atlas:** Check [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

## Next Steps

After successful deployment:

1. Set up monitoring and error tracking (e.g., Sentry)
2. Configure analytics (e.g., Google Analytics)
3. Set up automated backups for MongoDB
4. Implement email notifications (if not already done)
5. Add custom domains
6. Set up SSL certificates (automatic with Netlify/Vercel)
7. Configure CDN caching for static assets

