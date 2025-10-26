import mongoose from 'mongoose';
import { config } from './config.js';

// Use the MongoDB URI from the config file
const MONGODB_URI = config.mongoUri;

// Log a masked version of the connection string for debugging
console.log(`Using MongoDB connection: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);


// Connect to MongoDB using Mongoose
async function connect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB using Mongoose');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Initialize database connection
connect();

// Export mongoose connection
export const db = mongoose.connection; 