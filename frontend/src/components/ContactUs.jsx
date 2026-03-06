// src/components/ContactUs.jsx
import React, { useState } from 'react';
import rntuBack from '../assets/rntu-back.jpg';
import '../admin/admin.css';
import '../integration-styles.css';
import './ContactUs.css';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
    const [formErrors, setFormErrors] = useState({});



    const handleChange = (e) => {
        const { name, value } = e.target;
        let errors = { ...formErrors };

        if (name === 'name') {
            if (value && !/^[a-zA-Z\s]+$/.test(value)) {
                errors.name = 'Name can only contain letters and spaces.';
            } else {
                delete errors.name;
            }
        }

        setFormErrors(errors);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message
                })
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
            
            // Hide the status message after 5 seconds
            setTimeout(() => setSubmitStatus(null), 5000);
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

            <div className="login-glass-card contact-glass-card">
                <h1 className="login-heading" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Contact Us</h1>

                <div className="contact-grid">

                    {/* Contact Info */}
                    <div style={{ paddingRight: '1rem' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 600 }}>Get in Touch</h3>
                        <p className="login-desc" style={{ lineHeight: '1.6', marginBottom: '2rem' }}>
                            Have questions about the campus or facing issues with navigation? Reach out to our support team.
                        </p>

                        <div style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.85)', display: 'flex', gap: '12px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📍</span>
                            <div>
                                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Address</strong>
                                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                                    Rabindranath Tagore University,<br />
                                    Village: Mendua, Post: Bhojpur,<br />
                                    Near Bangrasia Chouraha, Bhopal-Chiklod Road,<br />
                                    District: Raisen (M.P.)
                                </span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.85)', display: 'flex', gap: '12px' }}>
                            <span style={{ fontSize: '1.2rem' }}>✉️</span>
                            <div>
                                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Email</strong>
                                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>info@rntu.ac.in</span>
                            </div>
                        </div>

                        <div style={{ color: 'rgba(255,255,255,0.85)', display: 'flex', gap: '12px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📞</span>
                            <div>
                                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Phone</strong>
                                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>+91 XXXXXXXXXX</span>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Form */}
                    <form className="login-form" onSubmit={handleSubmit} style={{ gap: '16px' }}>
                        <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 600 }}>Send Feedback</h3>

                        <div className="login-input-group">
                            <label className="login-label">Full Name</label>
                            <div className="login-input-wrapper">
                                <span className="login-input-icon">👤</span>
                                <input 
                                    type="text" 
                                    name="name"
                                    placeholder="Your Full Name" 
                                    className="login-input" 
                                    value={formData.name}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                            {formErrors.name && <p style={{ color: '#fca5a5', fontSize: '0.8em', marginTop: '-4px', marginLeft: '6px' }}>{formErrors.name}</p>}
                        </div>

                        <div className="login-input-group">
                            <label className="login-label">Email Address</label>
                            <div className="login-input-wrapper">
                                <span className="login-input-icon">✉</span>
                                <input 
                                    type="email" 
                                    name="email"
                                    placeholder="Your Email Address" 
                                    className="login-input" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="login-input-group">
                            <label className="login-label">Message</label>
                            <textarea
                                name="message"
                                rows="4"
                                placeholder="Describe your issue or feedback..."
                                className="login-input"
                                style={{ resize: 'vertical', paddingLeft: '14px', minHeight: '100px' }}
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            className="login-submit-btn" 
                            style={{ 
                                marginTop: '10px',
                                opacity: isSubmitting ? 0.7 : 1,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <span className="login-spinner" /> : (
                                <>
                                    <span>Send Message</span>
                                    <span className="login-btn-arrow">→</span>
                                </>
                            )}
                        </button>
                        
                        {submitStatus === 'success' && (
                            <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>✓</span> Your message has been sent successfully!
                            </div>
                        )}
                        {submitStatus === 'error' && (
                            <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>✕</span> Failed to send message. Please try again.
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
