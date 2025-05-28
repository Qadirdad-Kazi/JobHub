// Script to clear all collections in the MongoDB database
import mongoose from 'mongoose';

// MongoDB connection string provided directly
const MONGODB_URI = 'mongodb+srv://princesonu590:Password1@jobhub.xg7aod2.mongodb.net/?retryWrites=true&w=majority&appName=JobHub';

console.log(`Using connection string: mongodb+srv://princesonu590:****@jobhub.xg7aod2.mongodb.net/?retryWrites=true&w=majority&appName=JobHub`);

async function clearDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.collections();
    
    if (collections.length === 0) {
      console.log('No collections found in the database.');
      return;
    }
    
    console.log('\nCollections found:');
    collections.forEach(collection => {
      console.log(`- ${collection.collectionName}`);
    });
    
    // Confirm before dropping collections
    console.log('\n⚠️  WARNING: This will delete ALL data from ALL collections! ⚠️');
    console.log('To proceed, type "yes" and press Enter.');
    console.log('To cancel, press Ctrl+C or type anything else.');
    
    // Read user input from command line
    const readline = (await import('readline')).default.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('> ', (answer) => {
        readline.close();
        resolve(answer.trim().toLowerCase());
      });
    });
    
    if (answer !== 'yes') {
      console.log('Operation cancelled. No data was deleted.');
      return;
    }
    
    // Drop each collection
    console.log('\nDropping collections:');
    for (const collection of collections) {
      const name = collection.collectionName;
      try {
        await collection.drop();
        console.log(`✅ Dropped collection: ${name}`);
      } catch (err) {
        console.error(`❌ Failed to drop collection ${name}:`, err.message);
      }
    }

    console.log('\n✅ Database clearing operation completed.');
  } catch (error) {
    console.error('\n❌ Error clearing database:', error);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  }
}

// Run the function
clearDatabase();
