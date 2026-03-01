// src/components/UserDetailsForm.jsx
import React, { useState } from 'react';
import { db } from '../firebase-config';
import { doc, setDoc } from "firebase/firestore";
import '../integration-styles.css';

const UserDetailsForm = ({ user, onComplete }) => {
    const [formData, setFormData] = useState({
        name: user?.displayName || '',
        phone: '',
        purpose: '',
        organization: '',
        designation: ''
    });
    const [loading, setLoading] = useState(false);

    const purposes = [
        "Student Admission",
        "Faculty Visit",
        "Campus Tour",
        "Event Attendance",
        "Administrative Work",
        "Other"
    ];

    const designations = [
        "Student",
        "Parent",
        "Professor",
        "Guest Lecturer",
        "Corporate Delegate",
        "Alumni",
        "Other"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create/Update user document in 'users' collection
            await setDoc(doc(db, "users", user.uid), {
                ...formData,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: new Date().toISOString()
            }, { merge: true });

            onComplete(); // Navigate to main app
        } catch (error) {
            console.error("Error saving user details:", error);
            alert("Failed to save details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <form onSubmit={handleSubmit} className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', color: '#1d3557', marginBottom: '1.5rem' }}>One Last Step</h2>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#457b9d' }}>
                    Please complete your profile to continue.
                </p>

                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+91 XXXXX XXXXX"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Purpose of Visit</label>
                    <select
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        required
                        className="form-input"
                    >
                        <option value="">Select Purpose</option>
                        {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Organization / Institute</label>
                    <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Designation <span style={{ fontWeight: 'normal', fontSize: '0.8em' }}>(Optional)</span></label>
                    <select
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="form-input"
                    >
                        <option value="">Select Designation</option>
                        {designations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Continue to Map'}
                </button>
            </form>
        </div>
    );
};

export default UserDetailsForm;
