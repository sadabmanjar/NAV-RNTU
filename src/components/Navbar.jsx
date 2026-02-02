// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import rntuLogo from '../assets/rntu-logo.jpg';
import '../integration-styles.css';

const Navbar = ({ user, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar glass-panel-dark">
            <div className="navbar-brand">
                <img src={rntuLogo} alt="RNTU Logo" className="navbar-logo" />
                <div className="navbar-title">
                    <span style={{ color: '#a96a6aff' }}>CAMPUS</span>
                    <span style={{ color: '#fff' }}>NAVIGATION</span>
                </div>
            </div>

            <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
                <span className={`hamburger-icon ${isMenuOpen ? 'open' : ''}`}></span>
            </button>

            <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                {user ? (
                    <div className="user-section">
                        <img
                            src={user.photoURL}
                            alt="Profile"
                            className="user-avatar"
                        />
                        <button
                            onClick={() => { onLogout(); setIsMenuOpen(false); }}
                            className="btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/" className="nav-login-btn" onClick={() => setIsMenuOpen(false)}>Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
