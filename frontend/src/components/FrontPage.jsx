// src/components/FrontPage.jsx
import rntuLogo from '../assets/rntu-logo.png';
import '../integration-styles.css';

const FrontPage = ({ onLogin }) => {
    return (
        <div className="front-page">
            {/* Hero Section */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                padding: '0 20px'
            }}>

                {/* Abstract Background Shapes */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(230,57,70,0.4) 0%, rgba(29,53,87,0) 70%)',
                    borderRadius: '50%',
                    zIndex: -1
                }}></div>

                <div className="glass-panel" style={{
                    padding: '3rem',
                    maxWidth: '800px',
                    width: '100%',
                    textAlign: 'center',
                    marginTop: '60px' // Offset for navbar
                }}>
                    {/* Logo Placeholder */}
                    <div style={{ marginBottom: '2rem' }}>
                        <img src={rntuLogo} alt="RNTU Logo" style={{ maxWidth: '400px', width: '100%', height: 'auto', marginBottom: '1rem' }} />
                        <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', lineHeight: 1.1, display: 'none' }}>
                            <span style={{ color: '#e63946' }}>RNTU</span> <br />
                            Campus Navigation
                        </h1>
                        <p style={{
                            fontSize: '1.2rem',
                            color: '#457b9d',
                            fontWeight: 500,
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            Find your way, Shape your Future
                        </p>
                    </div>

                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '3rem', color: '#1d3557' }}>
                        Welcome to the official navigation portal of Rabindranath Tagore University.
                        Locate departments, hostels, and amenities with our interactive campus map.
                    </p>

                    <button
                        onClick={onLogin}
                        className="btn-primary"
                        style={{ fontSize: '1.2rem', padding: '15px 40px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.35 11.1H12.18V13.83H17.45C17.22 15.05 16.52 16.08 15.42 16.82L15.39 16.96L18.42 19.31L18.63 19.33C20.53 17.58 21.62 15 21.62 12.01C21.62 11.66 21.59 11.37 21.54 11.1H21.35Z" fill="#FBBC05" />
                            <path d="M12.18 21C14.83 21 17.06 20.12 18.63 18.67L15.42 16.16C14.54 16.75 13.43 17.09 12.18 17.09C9.62 17.09 7.45 15.36 6.67 13.01L6.53 13.02L3.38 15.45L3.33 15.54C4.9 18.65 8.31 21 12.18 21Z" fill="#34A853" />
                            <path d="M6.67 13.01C6.47 12.4 6.36 11.75 6.36 11.1C6.36 10.45 6.47 9.8 6.67 9.19L6.66 9.07L3.46 6.58L3.33 6.66C2.66 7.99 2.27 9.5 2.27 11.1C2.27 12.7 2.66 14.21 3.33 15.54L6.67 13.01Z" fill="#EA4335" />
                            <path d="M12.18 5.1C13.62 5.1 14.91 5.6 15.93 6.57L18.7 3.8C16.96 2.18 14.75 1.22 12.18 1.22C8.31 1.22 4.9 3.57 3.33 6.66L6.67 9.19C7.45 6.84 9.62 5.1 12.18 5.1Z" fill="#4285F4" />
                        </svg>
                        Sign in with Google
                    </button>
                </div>
            </section>
        </div>
    );
};

export default FrontPage;
