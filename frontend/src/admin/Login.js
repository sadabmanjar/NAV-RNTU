import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import rntuBack from '../assets/rntu-back.jpg';
import rntuLogo from '../assets/rntu-logo.png';
import './admin.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        navigate('/manage-system/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Animated Campus Background */}
      <div className="login-bg-image" style={{ backgroundImage: `url(${rntuBack})` }} />

      {/* Dark gradient overlay */}
      <div className="login-bg-overlay" />

      {/* Floating particles */}
      <div className="login-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`login-particle login-particle-${i + 1}`} />
        ))}
      </div>

      {/* Login Card */}
      <div className="login-glass-card">

        {/* Logo */}
        <div className="login-card-header" style={{ justifyContent: 'center', marginBottom: '10px' }}>
          <div className="login-logo-wrapper">
            <img src={rntuLogo} alt="RNTU Logo" className="login-logo-main" />
          </div>
        </div>

        <div className="login-divider" />

        <h2 className="login-heading">Welcome Back</h2>
        <p className="login-desc">Sign in to manage your campus dashboard</p>

        {error && (
          <div className="login-error-msg">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-input-group">
            <label className="login-label">Email Address</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">✉</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rntu.ac.in"
                required
                className="login-input"
              />
            </div>
          </div>

          <div className="login-input-group">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="login-input"
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <>
                <span>Sign In</span>
                <span className="login-btn-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <p className="login-footer-text">🔐 Secured Admin Access — RNTU Campus Navigation System</p>
      </div>
    </div>
  );
};

export default Login;
