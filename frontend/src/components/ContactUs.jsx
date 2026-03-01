// src/components/ContactUs.jsx
import React, { useState } from 'react';
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

    // Replace this string with the URL you get after deploying your Google Apps Script
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVfxtD_IXHmTu3gFgitjLR8564lDFVs1RrNGBgEf88gorZ0bVEXACvYYPLeVH2JgH8HQ/exec';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        
        try {
            // We use URLSearchParams to send data as application/x-www-form-urlencoded
            // This is properly parsed by Google Apps Script e.parameter
            const data = new URLSearchParams();
            data.append("Name", formData.name);
            data.append("Email", formData.email);
            data.append("Message", formData.message);

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: data,
                mode: 'no-cors' // Google Scripts often require no-cors for simple requests from browser
            });

            // Since mode is 'no-cors', the response will be "opaque" (status 0). 
            // We just assume success if it didn't throw a network error.
            setSubmitStatus('success');
            setFormData({ name: '', email: '', message: '' });
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
        <div className="contact-container">
            <div className="glass-panel contact-glass-panel">
                <h1 style={{ color: '#1d3557', textAlign: 'center', marginBottom: '2rem' }}>Contact Us</h1>

                <div className="contact-grid">

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
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <h3 style={{ color: '#e63946', marginBottom: '0.5rem' }}>Send Feedback</h3>

                        <input 
                            type="text" 
                            name="name"
                            placeholder="Your Name" 
                            className="form-input" 
                            value={formData.name}
                            onChange={handleChange}
                            required 
                        />
                        <input 
                            type="email" 
                            name="email"
                            placeholder="Your Email" 
                            className="form-input" 
                            value={formData.email}
                            onChange={handleChange}
                            required 
                        />
                        <textarea
                            name="message"
                            rows="5"
                            placeholder="Message"
                            className="form-input"
                            style={{ resize: 'vertical' }}
                            value={formData.message}
                            onChange={handleChange}
                            required
                        ></textarea>

                        <button 
                            type="submit" 
                            className="btn-secondary" 
                            style={{ 
                                alignSelf: 'start', 
                                opacity: isSubmitting ? 0.7 : 1,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                        
                        {submitStatus === 'success' && (
                            <div style={{ color: '#10b981', marginTop: '10px', fontSize: '14px', fontWeight: '500' }}>
                                ✓ Your message has been sent successfully!
                            </div>
                        )}
                        {submitStatus === 'error' && (
                            <div style={{ color: '#ef4444', marginTop: '10px', fontSize: '14px', fontWeight: '500' }}>
                                ✕ Failed to send message. Please try again.
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
