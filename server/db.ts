import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerconnectpro';

// Create a MongoDB client
const client = new MongoClient(MONGODB_URI);

// Connect to the database
async function connect() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Export the database instance
export const db = await connect(); 