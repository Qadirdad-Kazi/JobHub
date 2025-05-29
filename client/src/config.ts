/**
 * Application configuration using environment variables
 * This centralizes all environment-based configuration in one place
 */

export const config = {
  // API configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000, // 30 seconds
  },
  
  // Application information
  app: {
    name: import.meta.env.VITE_APP_NAME || 'JobHub',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
    isDevelopment: (import.meta.env.VITE_APP_ENVIRONMENT || 'development') === 'development',
    isProduction: (import.meta.env.VITE_APP_ENVIRONMENT || 'development') === 'production',
  },
  
  // Authentication
  auth: {
    tokenKey: 'token',
    userKey: 'user',
  },
  
  // Feature flags
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  },
};

// Log configuration in development mode only
if (config.app.isDevelopment) {
  console.log('App config:', {
    ...config,
    // Don't log sensitive information
    auth: '***',
  });
}
