/**
 * Responsive Navigation Bar (client/src/components/Navbar.jsx)
 * Included on all protected pages with active link highlights,
 * user greeting, and logout functionality.
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm py-2">
      <div className="container">
        {/* Brand */}
        <NavLink className="navbar-brand d-flex align-items-center" to="/dashboard">
          <i className="bi bi-mortarboard-fill fs-3 me-2 text-warning"></i>
          <div>
            <span className="fw-bold tracking-tight">EduTrack</span>
            <small className="d-block text-white-50" style={{ fontSize: '0.65rem', marginTop: '-4px' }}>
              Student Management
            </small>
          </div>
        </NavLink>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links & User Profile Actions */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link px-3 ${isActive ? 'active' : ''}`}
              >
                <i className="bi bi-grid-1x2-fill me-1"></i> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/students"
                className={({ isActive }) => `nav-link px-3 ${isActive ? 'active' : ''}`}
              >
                <i className="bi bi-people-fill me-1"></i> Students Directory
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-link px-3 ${isActive ? 'active' : ''}`}
              >
                <i className="bi bi-person-badge-fill me-1"></i> My Profile
              </NavLink>
            </li>
            {user?.role === 'admin' && (
              <li className="nav-item">
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `nav-link px-3 text-warning fw-bold ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-shield-lock-fill me-1"></i> Admin Console
                </NavLink>
              </li>
            )}
            <li className="nav-item d-none d-lg-block ms-lg-2 my-auto">
              <NavLink
                to="/students?add=true"
                className="btn btn-warning btn-sm fw-bold text-dark px-3 py-1 rounded-pill shadow-sm"
              >
                <i className="bi bi-person-plus-fill me-1"></i> + Register Student
              </NavLink>
            </li>
            <li className="nav-item d-lg-none mt-2">
              <NavLink
                to="/students?add=true"
                className="btn btn-warning btn-sm fw-bold text-dark w-100 py-2"
              >
                <i className="bi bi-person-plus-fill me-1"></i> + Register New Student
              </NavLink>
            </li>
          </ul>

          {/* User Info & Logout Button */}
          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-md-block text-white">
              <div className="fw-semibold small">
                {user?.fullName || 'Faculty User'}
                {user?.role === 'admin' && (
                  <span className="badge bg-danger ms-2" style={{ fontSize: '0.65rem' }}>Admin</span>
                )}
              </div>
              <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                {user?.department || 'Department'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 shadow-sm px-3"
              title="Logout from system"
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
