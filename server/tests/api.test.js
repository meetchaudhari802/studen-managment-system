/**
 * Automated Test Suite (server/tests/api.test.js)
 * Tests Authentication, RBAC, Faculty Data Isolation, Role Gates,
 * Future Attendance Rejection, and Student Password Login.
 * Uses mongodb-memory-server and supertest.
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_super_secure_12345';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('1. Health Check Endpoint', () => {
  it('GET /api/health should return 200 with healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('2. User & Faculty Authentication', () => {
  it('should register a new faculty user with password >= 8 chars', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Dr. Test Professor',
        email: 'prof.test@college.edu',
        mobile: '9876543210',
        department: 'Computer Science',
        password: 'Password@123',
        confirmPassword: 'Password@123'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('prof.test@college.edu');
  });

  it('should reject registration if password is less than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Dr. Short Pass',
        email: 'short@college.edu',
        mobile: '9876543210',
        department: 'Computer Science',
        password: 'pass',
        confirmPassword: 'pass'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/8 characters/i);
  });

  it('should reject registration if mobile is not 10 digits', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Dr. Bad Mobile',
        email: 'badmobile@college.edu',
        mobile: '12345',
        department: 'Computer Science',
        password: 'Password@123',
        confirmPassword: 'Password@123'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/10 digits/i);
  });

  it('should authenticate user and reject incorrect password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Prof. Login Test',
        email: 'login.test@college.edu',
        mobile: '9876543210',
        department: 'IT',
        password: 'Password@123'
      });

    // Valid login
    const validRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login.test@college.edu',
        password: 'Password@123'
      });
    expect(validRes.status).toBe(200);
    expect(validRes.body.token).toBeDefined();

    // Invalid login
    const invalidRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login.test@college.edu',
        password: 'WrongPassword@999'
      });
    expect(invalidRes.status).toBe(401);
  });
});

describe('3. Faculty Data Isolation (Faculty A vs Faculty B)', () => {
  it('Faculty A must NOT see Faculty B students', async () => {
    // 1. Register Faculty A
    const resA = await request(app).post('/api/auth/register').send({
      fullName: 'Faculty Alpha',
      email: 'alpha@college.edu',
      mobile: '9000000001',
      department: 'CSE',
      password: 'Password@123'
    });
    const tokenA = resA.body.token;

    // 2. Register Faculty B
    const resB = await request(app).post('/api/auth/register').send({
      fullName: 'Faculty Beta',
      email: 'beta@college.edu',
      mobile: '9000000002',
      department: 'IT',
      password: 'Password@123'
    });
    const tokenB = resB.body.token;

    // 3. Faculty A creates Student A
    await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        enrollmentNo: 'CSE101',
        name: 'Student Under Alpha',
        email: 'alpha.student@college.edu',
        mobile: '9111111111',
        course: 'B.Tech CSE',
        semester: 4,
        password: 'Student@123'
      });

    // 4. Faculty B queries /api/students
    const listResB = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(listResB.status).toBe(200);
    // Student A must NOT be visible to Faculty B
    const hasStudentA = listResB.body.data.some(s => s.enrollmentNo === 'CSE101');
    expect(hasStudentA).toBe(false);
    expect(listResB.body.count).toBe(0);

    // 5. Faculty A queries /api/students and sees Student A
    const listResA = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(listResA.status).toBe(200);
    expect(listResA.body.count).toBe(1);
    expect(listResA.body.data[0].enrollmentNo).toBe('CSE101');
  });
});

describe('4. Role Boundaries & Access Control', () => {
  it('Student token must get 403 on /api/students (faculty endpoint)', async () => {
    // Create student
    const studentRes = await request(app).post('/api/students/public-register').send({
      enrollmentNo: 'STU999',
      name: 'Independent Student',
      email: 'stu999@college.edu',
      mobile: '9888888888',
      course: 'BCA',
      semester: 2,
      password: 'Student@123'
    });

    // Login as student
    const loginRes = await request(app).post('/api/students/login').send({
      enrollmentNo: 'STU999',
      password: 'Student@123'
    });
    const studentToken = loginRes.body.token;

    // Attempt faculty endpoint
    const accessRes = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(accessRes.status).toBe(403);
  });

  it('Faculty token must get 403 on /api/students/portal-data (student endpoint)', async () => {
    // Register faculty
    const facRes = await request(app).post('/api/auth/register').send({
      fullName: 'Faculty Gatekeeper',
      email: 'gate@college.edu',
      mobile: '9777777777',
      department: 'ECE',
      password: 'Password@123'
    });
    const facultyToken = facRes.body.token;

    // Attempt student portal endpoint
    const portalRes = await request(app)
      .get('/api/students/portal-data')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(portalRes.status).toBe(403);
  });

  it('Invalid ObjectId format must return 400 Bad Request', async () => {
    const facRes = await request(app).post('/api/auth/register').send({
      fullName: 'Faculty Validator',
      email: 'val@college.edu',
      mobile: '9666666666',
      department: 'ME',
      password: 'Password@123'
    });
    const token = facRes.body.token;

    const res = await request(app)
      .get('/api/students/not-a-valid-object-id-123')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid ID format/i);
  });
});

describe('5. Attendance Rules', () => {
  it('should reject marking attendance for a future date with 400', async () => {
    // Register faculty
    const facRes = await request(app).post('/api/auth/register').send({
      fullName: 'Attendance Prof',
      email: 'att.prof@college.edu',
      mobile: '9555555555',
      department: 'CSE',
      password: 'Password@123'
    });
    const token = facRes.body.token;

    // Create student
    const stuRes = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        enrollmentNo: 'ATT2024',
        name: 'Attendance Student',
        email: 'att.student@college.edu',
        mobile: '9444444444',
        course: 'B.Tech CSE',
        semester: 3,
        password: 'Student@123'
      });
    const studentId = stuRes.body.data._id;

    // Tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const futureDateStr = tomorrow.toISOString().split('T')[0];

    const attRes = await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentId,
        date: futureDateStr,
        status: 'Present'
      });

    expect(attRes.status).toBe(400);
    expect(attRes.body.message).toMatch(/future/i);
  });
});

describe('6. Safe Search with Special Characters', () => {
  it('should safely handle special regex characters like "(" and "*" without crashing', async () => {
    const facRes = await request(app).post('/api/auth/register').send({
      fullName: 'Search Prof',
      email: 'search.prof@college.edu',
      mobile: '9333333333',
      department: 'CSE',
      password: 'Password@123'
    });
    const token = facRes.body.token;

    const res = await request(app)
      .get('/api/students?search=(CSE*')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
