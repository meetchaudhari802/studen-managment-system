/**
 * Database Configuration (server/config/db.js)
 * Connects to MongoDB using Mongoose.
 * For PBL viva explanation:
 * - Reads connection URI from environment variable (.env)
 * - Uses Mongoose ODM for schema-based data modeling
 * - Includes automatic fallback to embedded in-memory MongoDB
 *   if local mongod daemon is not currently running.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Use reliable public DNS resolvers to prevent querySrv ECONNREFUSED on MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Fallback to system default if restricted
}

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_management';

  try {
    // Attempt connecting to local MongoDB daemon
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000 // Fast fail to fallback if service is stopped
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    const seedData = require('./seedHelper');
    await seedData(false);
  } catch (error) {
    console.warn(`[MongoDB] Local daemon not reachable at ${uri} (${error.message}).`);
    console.log('[MongoDB] Launching embedded MongoDB instance for seamless PBL testing...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const fallbackUri = mongodInstance.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`[MongoDB] Embedded server active and connected at: ${fallbackUri}`);
      const seedData = require('./seedHelper');
      await seedData(false);
    } catch (fallbackError) {
      console.error(`[MongoDB] Connection Failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
