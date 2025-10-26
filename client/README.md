# JobHub Frontend

This is the frontend application for JobHub, built with React, TypeScript, and Vite.

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the `client` directory:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your backend API URL:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment to Netlify

### Option 1: Using Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

### Option 2: Using Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Configure build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
4. Add environment variables in Netlify dashboard
5. Deploy

## Environment Variables

All environment variables must be prefixed with `VITE_` to be exposed to the client:

- `VITE_API_URL` - Backend API URL (required)
- `VITE_APP_NAME` - Application name (optional)
- `VITE_APP_VERSION` - Application version (optional)
- `VITE_APP_ENVIRONMENT` - Environment (optional)
- `VITE_ENABLE_ANALYTICS` - Enable analytics (optional)
- `VITE_ENABLE_NOTIFICATIONS` - Enable notifications (optional)

## Project Structure

```
client/
├── public/          # Static assets
├── src/
│   ├── components/  # React components
│   ├── pages/       # Page components
│   ├── lib/         # Utilities and helpers
│   ├── hooks/       # Custom React hooks
│   ├── context/     # React context providers
│   ├── types/       # TypeScript type definitions
│   ├── services/    # API services
│   └── config.ts    # Configuration
├── index.html       # HTML template
├── netlify.toml     # Netlify configuration
└── package.json     # Dependencies and scripts
```

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port.

### API Connection Issues

Make sure:
1. Backend server is running
2. `VITE_API_URL` is correctly set in `.env`
3. CORS is properly configured on the backend

### Build Failures

1. Clear the cache: `rm -rf node_modules dist`
2. Reinstall dependencies: `npm install`
3. Try building again: `npm run build`

## Support

For more information, see the main [DEPLOYMENT.md](../DEPLOYMENT.md) file in the project root.

