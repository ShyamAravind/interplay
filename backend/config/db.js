const mongoose = require('mongoose');
const seedData = require('../seed');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);

    // In production, fail fast — mongodb-memory-server won't work on Render
    if (process.env.NODE_ENV === 'production') {
      console.error('Production mode: MONGO_URI is required. Exiting.');
      process.exit(1);
    }

    console.log('Falling back to mongodb-memory-server (dev only)...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      
      // Auto-seed the in-memory database
      await seedData();
      
    } catch (inMemError) {
      console.error(`In-Memory MongoDB failed: ${inMemError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
