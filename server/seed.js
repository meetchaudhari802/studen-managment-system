/**
 * Database Seed Script (server/seed.js)
 * Creates a demo faculty user, ~10 realistic students, and historical attendance records.
 * Run via: npm run seed (or node seed.js)
 */

const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing demo data...');
    // Find or clean up demo user
    const demoEmail = 'teacher@college.edu';
    let demoUser = await User.findOne({ email: demoEmail });

    if (demoUser) {
      await Attendance.deleteMany({ markedBy: demoUser._id });
      await Student.deleteMany({ createdBy: demoUser._id });
      await User.deleteOne({ _id: demoUser._id });
      console.log('[Seed] Removed previous demo teacher and associated records.');
    }

    const bcrypt = require('bcryptjs');

    // 0. Ensure Admin User exists
    const adminEmail = 'admin@college.edu';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        fullName: 'Dean of Academic Affairs',
        email: adminEmail,
        mobile: '9876543211',
        department: 'Administration',
        password: 'Admin@123',
        role: 'admin'
      });
      console.log(`[Seed] Created Admin user: ${adminUser.email} (Password: Admin@123)`);
    }

    // 1. Create Demo Teacher
    console.log('[Seed] Creating demo faculty user...');
    demoUser = await User.create({
      fullName: 'Prof. Rajesh Sharma',
      email: demoEmail,
      mobile: '9876543210',
      department: 'Computer Science & Engineering',
      password: 'Password@123',
      role: 'faculty'
    });
    console.log(`[Seed] Created demo user: ${demoUser.email} (Password: Password@123)`);

    // 2. Create 10 Sample Students
    console.log('[Seed] Creating 10 sample students...');
    const studentsData = [
      {
        enrollmentNo: 'CSE2024001',
        name: 'Aarav Patel',
        email: 'aarav.patel@student.edu',
        mobile: '9123456780',
        course: 'B.Tech CSE',
        semester: 6,
        address: 'Sector 14, Gandhinagar'
      },
      {
        enrollmentNo: 'CSE2024002',
        name: 'Priya Iyer',
        email: 'priya.iyer@student.edu',
        mobile: '9123456781',
        course: 'B.Tech CSE',
        semester: 6,
        address: 'Bandra West, Mumbai'
      },
      {
        enrollmentNo: 'CSE2024003',
        name: 'Rohan Gupta',
        email: 'rohan.gupta@student.edu',
        mobile: '9123456782',
        course: 'B.Tech CSE',
        semester: 4,
        address: 'Civil Lines, Jaipur'
      },
      {
        enrollmentNo: 'IT2024001',
        name: 'Ananya Deshmukh',
        email: 'ananya.d@student.edu',
        mobile: '9123456783',
        course: 'B.Tech IT',
        semester: 6,
        address: 'Kothrud, Pune'
      },
      {
        enrollmentNo: 'IT2024002',
        name: 'Vikramaditya Rao',
        email: 'vikram.rao@student.edu',
        mobile: '9123456784',
        course: 'B.Tech IT',
        semester: 4,
        address: 'Indiranagar, Bengaluru'
      },
      {
        enrollmentNo: 'BCA202401',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@student.edu',
        mobile: '9123456785',
        course: 'BCA',
        semester: 2,
        address: 'Banjara Hills, Hyderabad'
      },
      {
        enrollmentNo: 'BCA202402',
        name: 'Kabir Verma',
        email: 'kabir.verma@student.edu',
        mobile: '9123456786',
        course: 'BCA',
        semester: 2,
        address: 'Aliganj, Lucknow'
      },
      {
        enrollmentNo: 'MCA202401',
        name: 'Meera Nair',
        email: 'meera.nair@student.edu',
        mobile: '9123456787',
        course: 'MCA',
        semester: 4,
        address: 'Panampilly Nagar, Kochi'
      },
      {
        enrollmentNo: 'MCA202402',
        name: 'Aditya Sen',
        email: 'aditya.sen@student.edu',
        mobile: '9123456788',
        course: 'MCA',
        semester: 4,
        address: 'Salt Lake City, Kolkata'
      },
      {
        enrollmentNo: 'CSE2024004',
        name: 'Tanvi Joshi',
        email: 'tanvi.joshi@student.edu',
        mobile: '9123456789',
        course: 'B.Tech CSE',
        semester: 6,
        address: 'Navrangpura, Ahmedabad'
      }
    ];

    const hashedStudentPassword = bcrypt.hashSync('Student@123', 10);
    const createdStudents = await Student.insertMany(
      studentsData.map(s => ({
        ...s,
        createdBy: demoUser._id,
        assignedFaculty: demoUser._id,
        password: hashedStudentPassword,
        registrationType: 'faculty'
      }))
    );
    console.log(`[Seed] Successfully inserted ${createdStudents.length} students.`);

    // 3. Create Sample Attendance records for today and recent days
    console.log('[Seed] Generating attendance records...');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const attendanceRecords = [];

    createdStudents.forEach((student, index) => {
      // Today's attendance (8 present, 2 absent)
      attendanceRecords.push({
        student: student._id,
        date: today,
        status: index % 5 === 0 ? 'Absent' : 'Present',
        markedBy: demoUser._id
      });

      // Yesterday's attendance
      attendanceRecords.push({
        student: student._id,
        date: yesterday,
        status: index % 4 === 0 ? 'Absent' : 'Present',
        markedBy: demoUser._id
      });

      // 2 days ago
      attendanceRecords.push({
        student: student._id,
        date: twoDaysAgo,
        status: 'Present',
        markedBy: demoUser._id
      });
    });

    await Attendance.insertMany(attendanceRecords);
    console.log(`[Seed] Successfully inserted ${attendanceRecords.length} attendance records.`);

    console.log('---------------------------------------------------------');
    console.log('[Seed] Database seeding completed successfully!');
    console.log(`[Seed] 1. Faculty Login -> Email: ${demoEmail} | Password: Password@123`);
    console.log(`[Seed] 2. Admin Login   -> Email: ${adminEmail} | Password: Admin@123`);
    console.log(`[Seed] 3. Student Login -> Enrollment: CSE2024001 | Password: Student@123`);
    console.log('---------------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
