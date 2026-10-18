# EduTrack - MERN Student Management System
> **College PBL (Problem-Based Learning) Micro Project**

A complete, responsive, secure, and production-ready full-stack Student Management System built using the MERN stack (MongoDB, Express.js, React 18, Node.js) with Bootstrap 5 and JSON Web Token (JWT) role-based authentication.

---

## 🚀 Key Features

### 1. Three-Role Role-Based Access Control (RBAC)
- **Administrator (Dean)**: System-wide oversight, all department student records, faculty account management, department health analytics.
- **Faculty (Professor)**: Teacher-isolated directory (only sees assigned/created students), attendance marking, course analytics, student management.
- **Student (Self-Service Portal)**: Public admission registration, secure enrollment login, attendance standing, low-attendance alerts (<75%), and password management.

### 2. Student Self-Registration & Portal
- **Public Registration**: Students self-enroll via `/student-register` with name, unique enrollment number, email, 10-digit mobile, course, semester, department mentor, and password ($\ge 8$ characters).
- **Hashed Student Passwords**: All student passwords are automatically hashed with `bcryptjs` (cost factor 10) with `select: false` on the schema.
- **Faculty Initial Password**: Faculty-created students are automatically initialized with `Student@123` so students can immediately log in and change their password.
- **Student Dashboard**: Dedicated portal (`/student-dashboard`) displaying attendance percentage, verified lecture history, faculty mentor contact, and report printing.

### 3. Faculty Dashboard & Student Directory
- **Strict Faculty Data Isolation**: Faculty A cannot view, modify, delete, or mark attendance for Faculty B's students.
- **Pagination & Filters**: Server-side pagination (10 per page) with course and semester dropdown filtering.
- **Safe Regex Search**: Escapes special characters (`(`, `*`, `+`) preventing regex crashes and injection.
- **Attendance Rules**: Rejects future dates with HTTP 400 Bad Request; compound unique index `(student, date)` prevents duplicates.

### 4. Security & Production Engineering
- **Minimum Password Length**: Enforced $\ge 8$ characters across all registration, profile, and student portals.
- **Brute-Force Rate Limiting**: `express-rate-limit` limits login attempts to 10 per 15-minute window per IP.
- **Invalid ID Handling**: Express middleware validates MongoDB ObjectIds and returns clean 400 errors instead of crashing with `CastError`.
- **Single-Service Serving**: In production, the Express backend serves `client/dist` and handles SPA routing (`app.get('*')`).
- **Automated Test Suite**: 11 automated Jest + supertest integration tests running with `mongodb-memory-server` via `npm test`.

---

## 🔑 Demo Credentials

| Role | Username / Identifier | Password | Access Level & Description |
|---|---|---|---|
| **Administrator (Dean)** | `admin@college.edu` | `Admin@123` | Institutional oversight, faculty audit, department analytics |
| **Faculty / Professor** | `teacher@college.edu` | `Password@123` | Student directory, daily attendance tracker, class analytics |
| **Enrolled Student** | `CSE2024001` | `Student@123` | Student self-service portal, attendance history, report print |

*(Note: On the Faculty/Admin Login page, 1-click demo buttons autofill demo credentials instantly for viva presentations).*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Bootstrap 5, Bootstrap Icons, React Router v6.
- **API Communication**: Native **Fetch API** (`client/src/services/api.js`). *Strictly zero Axios.*
- **Backend**: Node.js & Express.js REST API with centralized error & validation middleware.
- **Database**: MongoDB with Mongoose ODM (supports both local/Atlas MongoDB and automatic in-memory fallback).
- **Security**: JWT (`Authorization: Bearer <token>`), `bcryptjs`, `express-rate-limit`, safe regex sanitization.
- **Testing**: Jest, Supertest, `mongodb-memory-server`.

---

## 📂 Project Structure

```
student-management-system/
├── render.yaml                   # Cloud deployment blueprint (Render)
├── package.json                  # Root runner scripts (build, test, seed, start)
├── README.md                     # Project documentation & Viva cheatsheet
│
├── server/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection & in-memory fallback
│   │   └── seedHelper.js         # Auto-seeding on fresh database startup
│   ├── controllers/
│   │   ├── authController.js     # Faculty/Admin registration, login, JWT issuance
│   │   ├── studentController.js  # Student CRUD, pagination, filtering, student login/password
│   │   ├── attendanceController.js# Attendance marking, date validation, calculations
│   │   ├── profileController.js  # Faculty profile & password updates
│   │   ├── dashboardController.js# Faculty class metrics
│   │   └── adminController.js    # Dean administrative analytics & user list
│   ├── middleware/
│   │   ├── authMiddleware.js     # protect (faculty/admin), protectStudent, validateObjectId, loginLimiter
│   │   └── errorMiddleware.js    # Centralized JSON error handler & CastError parser
│   ├── models/
│   │   ├── User.js               # Faculty/Admin schema (password minlength: 8)
│   │   ├── Student.js            # Student schema (hashed password select: false)
│   │   └── Attendance.js         # Attendance schema (compound unique index)
│   ├── tests/
│   │   └── api.test.js           # 11 automated Jest integration tests
│   ├── createAdmin.js            # Idempotent CLI script to bootstrap Dean admin
│   ├── seed.js                   # Database seed script
│   ├── server.js                 # Express server & production static serving
│   ├── .env.example              # Environment variables template
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Navigation bar with role badges & logout
    │   │   ├── ProtectedRoute.jsx# Auth route guard
    │   │   └── AlertMessage.jsx  # Reusable Bootstrap alert banners
    │   ├── context/
    │   │   └── AuthContext.jsx   # Faculty/Admin global auth state
    │   ├── pages/
    │   │   ├── Home.jsx          # Public landing page with portal links
    │   │   ├── Login.jsx         # Faculty/Admin login page
    │   │   ├── Register.jsx      # Faculty sign-up page
    │   │   ├── Dashboard.jsx     # Faculty executive dashboard
    │   │   ├── Students.jsx      # Student directory with pagination & filters
    │   │   ├── Profile.jsx       # Faculty profile management
    │   │   ├── StudentRegister.jsx# Public student admission self-registration
    │   │   ├── StudentLogin.jsx  # Student portal login with password
    │   │   ├── StudentDashboard.jsx# Student academic portal with password change
    │   │   └── AdminDashboard.jsx# Administrator oversight portal
    │   ├── services/
    │   │   └── api.js            # Native Fetch API abstraction
    │   ├── App.jsx               # Client routes
    │   └── main.jsx
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start Guide

### 1. Local Development (Two Processes)

#### Terminal 1 — Backend:
```bash
cd server
npm install
npm run dev
```
*Server runs on `http://localhost:5000` (provides `/api/health`).*

#### Terminal 2 — Frontend:
```bash
cd client
npm install
npm run dev
```
*Client runs on `http://localhost:5173` with Vite proxy forwarding `/api` to port 5000.*

---

### 2. Running Automated Tests

Run the full integration test suite with in-memory MongoDB:
```bash
cd server
npm test
```
*Executes all 11 test suites verifying health checks, RBAC gates, data isolation, rate limits, future date rejections, and regex safety.*

---

### 3. Bootstrap Admin User CLI

To create or verify the Dean Admin user:
```bash
cd server
npm run create-admin
```

---

### 4. Single-Service Production Run

Build client and run Express to serve both API and frontend on port 5000:
```bash
# 1. Build client
cd client
npm run build

# 2. Run server in production mode
cd ../server
NODE_ENV=production node server.js
```
Open `http://localhost:5000` — frontend and backend work as a single service.

---

### 5. Cloud Deployment (Render.com)

This project contains a `render.yaml` blueprint:
1. Push repository to GitHub.
2. In Render dashboard, click **New +** -> **Blueprint**.
3. Select your repository.
4. Set `MONGO_URI` environment variable to your MongoDB Atlas connection string.
5. Render automatically executes `npm run render-build` and `npm start`.

---

## 🎓 College Viva Cheatsheet (Questions & Answers)

### 1. What architecture does this project use?
> **Answer**: It follows the **MERN** architecture (MongoDB, Express, React, Node.js) with a separated client-server model. The backend exposes stateless RESTful APIs communicating via JSON, while the frontend is a Single Page Application (SPA) utilizing React Router for client-side navigation.

### 2. Why use JWT (JSON Web Tokens) instead of traditional session cookies?
> **Answer**: 
> - **Statelessness**: The server does not need to store session state in memory or database; it merely verifies the cryptographic signature of the token using `JWT_SECRET`.
> - **Scalability**: Works seamlessly across distributed microservices or separate frontend domains without CORS cookie complications.
> - **Bearer Token**: The client stores the token in `localStorage` and sends it via the `Authorization: Bearer <token>` header.

### 3. Why did we use the native Fetch API instead of Axios?
> **Answer**: 
> - Fetch is built natively into modern browsers, reducing production bundle size and eliminating external package vulnerabilities.
> - With a clean wrapper in `client/src/services/api.js`, Fetch easily handles automatic Bearer token injection, request JSON stringifying, and centralized HTTP error handling.

### 4. How is data isolation maintained between different teachers?
> **Answer**: 
> Every student record in MongoDB has a `createdBy` field storing the ObjectId of the teacher who created it, and optionally an `assignedFaculty` field. When queries are executed (`Student.find({ $or: [{ createdBy: req.user._id }, { assignedFaculty: req.user._id }] })`), the user ID extracted from the verified JWT ensures each teacher only accesses their own students. An admin (`role === 'admin'`) bypasses this filter.

### 5. How are duplicate attendance records prevented on the same day?
> **Answer**: 
> The `Attendance` schema contains a compound unique index:
> `attendanceSchema.index({ student: 1, date: 1 }, { unique: true });`
> Additionally, dates are normalized to midnight UTC (`00:00:00.000`) before saving, and the controller uses `findOneAndUpdate` with `upsert: true` so marking attendance for the same day updates the status rather than creating duplicates.

### 6. How is Student Portal authentication secured?
> **Answer**: 
> Students log in with their Enrollment Number and a hashed password. In the `Student` schema, `password` is marked with `select: false` so it is never accidentally returned in public student lists. Passwords are saved with a pre-save hook hashing them using `bcryptjs` (salt rounds: 10), and verified via a schema method `comparePassword`.

### 7. How does the application prevent ReDoS (Regular Expression Denial of Service)?
> **Answer**: 
> In `studentController.js`, user search strings pass through `escapeRegex(str)`:
> `str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`
> This prevents unescaped special regex characters like `(`, `*`, or `+` from causing runtime crashes or regex catastrophic backtracking.

### 8. How does rate limiting protect the application?
> **Answer**: 
> `express-rate-limit` is mounted on all login endpoints (`/api/auth/login` and `/api/students/login`), restricting repeated attempts to 10 requests per 15 minutes per IP address, stopping automated brute-force attacks.
