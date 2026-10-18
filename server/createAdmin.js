/**
 * Idempotent Admin Creation CLI Script (server/createAdmin.js)
 * Run via: npm run create-admin
 * Ensures an administrator account exists on fresh deployments.
 */

const dns = require('dns');
const dotenv = require('dotenv');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    console.log('[Admin Bootstrapper] Connecting to MongoDB...');
    await connectDB();

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@college.edu').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || 'Dean of Academic Affairs';
    const adminDepartment = process.env.ADMIN_DEPT || 'Administration';

    let existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`[Admin Bootstrapper] Existing user '${adminEmail}' elevated to 'admin' role.`);
      } else {
        console.log(`[Admin Bootstrapper] Administrator '${adminEmail}' already exists and is active.`);
      }
    } else {
      const newAdmin = await User.create({
        fullName: adminName,
        email: adminEmail,
        mobile: '9876543211',
        department: adminDepartment,
        password: adminPassword,
        role: 'admin'
      });
      console.log(`[Admin Bootstrapper] Created new Administrator account: ${newAdmin.email}`);
    }

    console.log('----------------------------------------------------');
    console.log('Admin Credentials Ready:');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error(`[Admin Bootstrapper] Error: ${err.message}`);
    process.exit(1);
  }
};

createAdmin();
