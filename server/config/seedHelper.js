/**
 * Seed Helper (server/config/seedHelper.js)
 * Populates demo teacher, 10 sample students, and historical attendance records.
 */

const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const seedData = async (forceClear = false) => {
  const demoEmail = 'teacher@college.edu';
  let demoUser = await User.findOne({ email: demoEmail });

  if (demoUser && forceClear) {
    await Attendance.deleteMany({ markedBy: demoUser._id });
    await Student.deleteMany({ createdBy: demoUser._id });
    await User.deleteOne({ _id: demoUser._id });
    demoUser = null;
  }

  if (!demoUser) {
    console.log('[Seed] Populating demo faculty account...');
    demoUser = await User.create({
      fullName: 'Prof. Rajesh Sharma',
      email: demoEmail,
      mobile: '9876543210',
      department: 'Computer Science & Engineering',
      password: 'Password@123',
      role: 'faculty'
    });
    console.log(`[Seed] Demo Faculty Created: ${demoUser.email} / Password@123`);

    // Ensure Demo Administrator account exists
    let adminUser = await User.findOne({ email: 'admin@college.edu' });
    if (!adminUser) {
      console.log('[Seed] Populating demo administrator account...');
      adminUser = await User.create({
        fullName: 'Dr. Arvind Mehta (Dean & Admin)',
        email: 'admin@college.edu',
        mobile: '9988776655',
        department: 'College Administration',
        password: 'Admin@123',
        role: 'admin'
      });
      console.log(`[Seed] Demo Admin Created: ${adminUser.email} / Admin@123`);
    }

    console.log('[Seed] Populating 10 sample students...');
    const sampleStudents = [
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

    const insertedStudents = await Student.insertMany(
      sampleStudents.map(s => ({ ...s, createdBy: demoUser._id }))
    );
    console.log(`[Seed] Inserted ${insertedStudents.length} students.`);

    console.log('[Seed] Populating initial attendance records...');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const attendanceRecords = [];
    insertedStudents.forEach((student, index) => {
      // Today (8 present, 2 absent)
      attendanceRecords.push({
        student: student._id,
        date: today,
        status: index % 5 === 0 ? 'Absent' : 'Present',
        markedBy: demoUser._id
      });
      // Yesterday
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
    console.log(`[Seed] Inserted ${attendanceRecords.length} attendance records.`);
  }

  // Always ensure demo admin exists
  const adminCheck = await User.findOne({ email: 'admin@college.edu' });
  if (!adminCheck) {
    console.log('[Seed] Creating demo administrator account...');
    await User.create({
      fullName: 'Dr. Arvind Mehta (Dean & Admin)',
      email: 'admin@college.edu',
      mobile: '9988776655',
      department: 'College Administration',
      password: 'Admin@123',
      role: 'admin'
    });
    console.log('[Seed] Demo Admin Created: admin@college.edu / Admin@123');
  }

  // Ensure any existing non-admin user has role set to 'faculty'
  await User.updateMany(
    { email: { $ne: 'admin@college.edu' }, role: { $ne: 'faculty' } },
    { $set: { role: 'faculty' } }
  );
};

module.exports = seedData;
