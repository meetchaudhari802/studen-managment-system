/**
 * API Service Layer (client/src/services/api.js)
 * Implements ALL backend API communication strictly using the native Fetch API (No Axios).
 * - Automatically injects JWT Bearer token from localStorage
 * - Centralizes JSON parsing and error handling
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

/**
 * Generic Fetch Wrapper
 * @param {string} endpoint - API path (e.g. '/auth/login')
 * @param {object} options - Fetch options (method, headers, body)
 * @returns {Promise<any>} - Resolved JSON data or rejected Error
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Add Authorization header if token exists and not already specified
  if (!headers['Authorization']) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers
  };

  // Stringify JSON body if present and not already a string
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    // If HTTP status is not 2xx, throw error with backend message
    if (!response.ok) {
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If backend isn't reachable (e.g., offline or network error)
    if (!error.status) {
      error.message = error.message || 'Unable to connect to server. Please ensure backend is running.';
    }
    throw error;
  }
}

// 1. Authentication APIs
export const authAPI = {
  // POST /api/auth/register
  register: (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: userData
    });
  },

  // POST /api/auth/login
  login: (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: credentials
    });
  }
};

// 2. Profile APIs
export const profileAPI = {
  // GET /api/profile
  getProfile: () => {
    return apiRequest('/profile', {
      method: 'GET'
    });
  },

  // PUT /api/profile
  updateProfile: (profileData) => {
    return apiRequest('/profile', {
      method: 'PUT',
      body: profileData
    });
  }
};

// 3. Students APIs
export const studentAPI = {
  // GET /api/students?search=&course=&semester=&page=&limit=
  getStudents: (params = {}) => {
    // Support either a string query (legacy) or an object with filters & pagination
    let queryParams = new URLSearchParams();
    if (typeof params === 'string') {
      if (params.trim()) queryParams.set('search', params.trim());
    } else if (typeof params === 'object') {
      if (params.search) queryParams.set('search', params.search);
      if (params.course && params.course !== 'ALL') queryParams.set('course', params.course);
      if (params.semester && params.semester !== 'ALL') queryParams.set('semester', params.semester);
      if (params.page) queryParams.set('page', params.page);
      if (params.limit) queryParams.set('limit', params.limit);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/students${queryString}`, {
      method: 'GET'
    });
  },

  // GET /api/students/:id
  getStudentById: (id) => {
    return apiRequest(`/students/${id}`, {
      method: 'GET'
    });
  },

  // POST /api/students
  createStudent: (studentData) => {
    return apiRequest('/students', {
      method: 'POST',
      body: studentData
    });
  },

  // PUT /api/students/:id
  updateStudent: (id, studentData) => {
    return apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: studentData
    });
  },

  // DELETE /api/students/:id
  deleteStudent: (id) => {
    return apiRequest(`/students/${id}`, {
      method: 'DELETE'
    });
  },

  // POST /api/students/public-register (Self-registration from Home page)
  publicRegister: (studentData) => {
    return apiRequest('/students/public-register', {
      method: 'POST',
      body: studentData
    });
  },

  // GET /api/students/public-faculty (Get faculty list for student registration)
  getPublicFaculty: () => {
    return apiRequest('/students/public-faculty', {
      method: 'GET'
    });
  },

  // POST /api/students/login (Student portal authentication via Enrollment No + Password)
  studentLogin: (credentials) => {
    return apiRequest('/students/login', {
      method: 'POST',
      body: credentials
    });
  },

  // PUT /api/students/change-password (Student password change)
  studentChangePassword: (passwords) => {
    const studentToken = localStorage.getItem('studentToken') || localStorage.getItem('token');
    return apiRequest('/students/change-password', {
      method: 'PUT',
      headers: studentToken ? { 'Authorization': `Bearer ${studentToken}` } : {},
      body: passwords
    });
  },

  // GET /api/students/portal-data (Student personal dashboard & attendance metrics)
  getStudentPortalData: () => {
    const studentToken = localStorage.getItem('studentToken') || localStorage.getItem('token');
    return apiRequest('/students/portal-data', {
      method: 'GET',
      headers: studentToken ? { 'Authorization': `Bearer ${studentToken}` } : {}
    });
  }
};

// 4. Attendance APIs
export const attendanceAPI = {
  // POST /api/attendance
  markAttendance: (attendanceData) => {
    return apiRequest('/attendance', {
      method: 'POST',
      body: attendanceData
    });
  },

  // GET /api/attendance/:studentId
  getStudentAttendance: (studentId) => {
    return apiRequest(`/attendance/${studentId}`, {
      method: 'GET'
    });
  }
};

// 5. Dashboard Stats API
export const dashboardAPI = {
  // GET /api/dashboard/stats
  getStats: () => {
    return apiRequest('/dashboard/stats', {
      method: 'GET'
    });
  }
};

// 6. Admin APIs
export const adminAPI = {
  // GET /api/admin/stats
  getStats: () => {
    return apiRequest('/admin/stats', {
      method: 'GET'
    });
  },

  // GET /api/admin/faculty
  getFaculty: () => {
    return apiRequest('/admin/faculty', {
      method: 'GET'
    });
  },

  // DELETE /api/admin/faculty/:id
  deleteFaculty: (id) => {
    return apiRequest(`/admin/faculty/${id}`, {
      method: 'DELETE'
    });
  },

  // GET /api/admin/students?search=
  getAllStudents: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/admin/students${query}`, {
      method: 'GET'
    });
  },

  // DELETE /api/admin/students/:id
  deleteStudent: (id) => {
    return apiRequest(`/admin/students/${id}`, {
      method: 'DELETE'
    });
  }
};
