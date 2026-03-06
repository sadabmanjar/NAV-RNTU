// src/components/FrontPage.jsx
import rntuBack from '../assets/rntu-back.jpg';
import rntuLogo from '../assets/rntu-logo.png';
import '../admin/admin.css';
import '../integration-styles.css';

const FrontPage = ({ onLogin }) => {
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
                    <div className="login-logo-wrapper" style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '15px 30px' }}>
                        <img src={rntuLogo} alt="RNTU Logo" className="login-logo-main" style={{ height: '90px' }} />
                    </div>
                </div>

                <div className="login-divider" />

                <h2 className="login-heading" style={{ textAlign: 'center', marginBottom: '15px' }}>Find your way, <span style={{ color: '#e63946' }}>Shape your Future</span></h2>
                <p className="login-desc" style={{ textAlign: 'center', fontSize: '1rem', lineHeight: '1.5' }}>
                    Welcome to the official navigation portal of Rabindranath Tagore University.<br/>
                    Locate departments, hostels, and amenities with our interactive campus map.
                </p>

                <div style={{ marginTop: '30px' }}>
                    <button
                        onClick={onLogin}
                        className="login-submit-btn"
                        style={{ fontSize: '1.1rem', padding: '16px', gap: '12px', background: 'rgba(255, 255, 255, 0.95)', color: '#333', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.35 11.1H12.18V13.83H17.45C17.22 15.05 16.52 16.08 15.42 16.82L15.39 16.96L18.42 19.31L18.63 19.33C20.53 17.58 21.62 15 21.62 12.01C21.62 11.66 21.59 11.37 21.54 11.1H21.35Z" fill="#FBBC05" />
                            <path d="M12.18 21C14.83 21 17.06 20.12 18.63 18.67L15.42 16.16C14.54 16.75 13.43 17.09 12.18 17.09C9.62 17.09 7.45 15.36 6.67 13.01L6.53 13.02L3.38 15.45L3.33 15.54C4.9 18.65 8.31 21 12.18 21Z" fill="#34A853" />
                            <path d="M6.67 13.01C6.47 12.4 6.36 11.75 6.36 11.1C6.36 10.45 6.47 9.8 6.67 9.19L6.66 9.07L3.46 6.58L3.33 6.66C2.66 7.99 2.27 9.5 2.27 11.1C2.27 12.7 2.66 14.21 3.33 15.54L6.67 13.01Z" fill="#EA4335" />
                            <path d="M12.18 5.1C13.62 5.1 14.91 5.6 15.93 6.57L18.7 3.8C16.96 2.18 14.75 1.22 12.18 1.22C8.31 1.22 4.9 3.57 3.33 6.66L6.67 9.19C7.45 6.84 9.62 5.1 12.18 5.1Z" fill="#4285F4" />
                        </svg>
                        <span style={{ fontWeight: 600 }}>Sign in with Google</span>
                        <span className="login-btn-arrow" style={{ color: '#000' }}>→</span>
                    </button>
                </div>

                <p className="login-desc" style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.85rem', opacity: 0.7 }}>
                   📍 Interactive Campus Map • Directory • Live Navigation
                </p>
            </div>
        </div>
    );
};

export default FrontPage;
