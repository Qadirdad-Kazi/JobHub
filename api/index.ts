import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from '../server/config.js';
import { registerRoutes } from '../server/routes.js';
import '../server/db.js'; // Initialize database connection

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(config.corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Register all routes
// registerRoutes returns a Server, but we just need it to register the routes on our app
registerRoutes(app);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  console.error('Error stack:', err.stack);
  
  // Provide more detailed error information
  const errorMessage = err.message || 'Something broke!';
  const errorDetails = process.env.NODE_ENV === 'development' ? {
    message: errorMessage,
    stack: err.stack,
    name: err.name
  } : { message: errorMessage };
  
  res.status(500).json(errorDetails);
});

// Export the Express app for Vercel
export default app;

