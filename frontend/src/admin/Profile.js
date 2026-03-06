import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const Profile = () => {
  const [adminData, setAdminData] = useState({ email: '', role: 'Super Admin' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setAdminData({ ...adminData, email: data.email });
      } else {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/manage-system/login');
          return;
        }
        console.error('Failed to fetch profile', data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
        <h2>Loading Profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-container-modern">
      {/* Cover and Header */}
      <div className="profile-cover"></div>
      <div className="profile-header-content">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            <div className="profile-avatar-inner">
              👑
            </div>
          </div>
          <div className="profile-title-area">
            <h1>{adminData.email || 'System Administrator'}</h1>
            <span className="profile-badge">Super Admin</span>
          </div>
        </div>
        <div className="profile-header-actions">
           <button 
             className="create-btn" 
             style={{ margin: 0, background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)' }}
             onClick={() => window.location.reload()}
           >
             Refresh Sync
           </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="profile-grid">
        <div className="profile-body-card">
          <div className="profile-section-header">
            <div className="profile-icon-bg">
              <span role="img" aria-label="user">👤</span>
            </div>
            <h3>Account Settings</h3>
          </div>
          <div className="profile-section-body">
            
            <div className="profile-form-group">
              <label>Email Address</label>
              <input type="email" value={adminData.email} disabled />
            </div>
            
            <div className="profile-form-group">
              <label>Role</label>
              <input type="text" value={adminData.role} disabled />
            </div>

            <div className="profile-form-group">
              <label>Timezone</label>
              <input type="text" value={Intl.DateTimeFormat().resolvedOptions().timeZone} disabled />
            </div>

             <div style={{ marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <h4 style={{ color: '#0f172a', marginBottom: '15px' }}>Security Settings</h4>
                <button 
                  className="create-btn" 
                  onClick={() => alert('Password reset link sent to admin email.')}
                >
                  Change Password
                </button>
             </div>
          </div>
        </div>

        {/* Side Stats */}
        <div className="profile-side-stats">
          <div className="profile-stat-box">
             <div className="stat-icon blue">🛡️</div>
             <div className="stat-info">
                <p>Security Level</p>
                <h4>Maximum</h4>
             </div>
          </div>
          <div className="profile-stat-box">
             <div className="stat-icon green">⚡</div>
             <div className="stat-info">
                <p>System Status</p>
                <h4>Online</h4>
             </div>
          </div>
          <div className="profile-stat-box">
             <div className="stat-icon purple">⏱️</div>
             <div className="stat-info">
                <p>Uptime</p>
                <h4>99.9%</h4>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
