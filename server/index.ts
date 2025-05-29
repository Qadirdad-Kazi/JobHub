import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { registerRoutes } from './routes.js';
import './db.js'; // Initialize database connection
import { setupVite, serveStatic, log } from "./vite.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(config.corsOptions));

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

      log(logLine);
    }
  });

  next();
});

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

// Start server
async function startServer() {
  try {
    const server = await registerRoutes(app);
    server.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
