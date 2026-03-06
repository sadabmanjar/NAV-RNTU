import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import rntuLogo from '../assets/rntu-logo.jpg';
import ConfirmModal from './ConfirmModal';
import './admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/manage-system/login');
  };

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="admin-container">
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Logout Confirmation"
        message="Are you sure you want to log out of the admin panel?"
        confirmText="Yes, Logout"
        cancelText="Stay"
        confirmColor="#ef4444"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={rntuLogo} alt="RNTU Logo" style={{ height: '40px', marginRight: '10px', borderRadius: '4px' }} />
            <h2>Admin Panel</h2>
          </div>
          <button className="hamburger-btn" onClick={toggleMenu}>
            ☰
          </button>
        </div>
        <div className={`admin-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/manage-system/dashboard" onClick={closeMenu} className={location.pathname === '/manage-system/dashboard' ? 'active' : ''}>Dashboard</Link>
          <Link to="/manage-system/locations" onClick={closeMenu} className={location.pathname === '/manage-system/locations' ? 'active' : ''}>Locations</Link>
          <Link to="/manage-system/events" onClick={closeMenu} className={location.pathname === '/manage-system/events' ? 'active' : ''}>Events</Link>
          <Link to="/manage-system/feedbacks" onClick={closeMenu} className={location.pathname === '/manage-system/feedbacks' ? 'active' : ''}>Feedbacks</Link>
          <Link to="/manage-system/users" onClick={closeMenu} className={location.pathname === '/manage-system/users' ? 'active' : ''}>Users</Link>
          <Link to="/manage-system/profile" onClick={closeMenu} className={location.pathname === '/manage-system/profile' ? 'active' : ''}>Profile</Link>
          <button onClick={() => { setShowLogoutModal(true); closeMenu(); }} className="logout-btn">Logout</button>
        </div>
      </div>
      <div className="admin-content" onClick={closeMenu}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
