// src/components/ContactUs.jsx
import React from 'react';
import '../integration-styles.css';

const ContactUs = () => {
    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="glass-panel" style={{ maxWidth: '800px', width: '90%', padding: '3rem', margin: '0 auto' }}>
                <h1 style={{ color: '#1d3557', textAlign: 'center', marginBottom: '2rem' }}>Contact Us</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>

                    {/* Contact Info */}
                    <div>
                        <h3 style={{ color: '#e63946', marginBottom: '1rem' }}>Get in Touch</h3>
                        <p style={{ lineHeight: '1.6', marginBottom: '2rem' }}>
                            Have questions about the campus or facing issues with navigation? Reach out to our support team.
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <strong>Address:</strong><br />
                            Rabindranath Tagore University,<br />
                            Village: Mendua, Post: Bhojpur,<br />
                            Near Bangrasia Chouraha, Bhopal-Chiklod Road,<br />
                            District: Raisen (M.P.)
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <strong>Email:</strong><br />
                            info@rntu.ac.in
                        </div>

                        <div>
                            <strong>Phone:</strong><br />
                            +91 XXXXXXXXXX
                        </div>
                    </div>

                    {/* Feedback Form */}
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ color: '#e63946', marginBottom: '0.5rem' }}>Send Feedback</h3>

                        <input type="text" placeholder="Your Name" className="form-input" required />
                        <input type="email" placeholder="Your Email" className="form-input" required />
                        <textarea
                            rows="5"
                            placeholder="Message"
                            className="form-input"
                            style={{ resize: 'vertical' }}
                            required
                        ></textarea>

                        <button type="submit" className="btn-secondary" style={{ alignSelf: 'start' }}>
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
