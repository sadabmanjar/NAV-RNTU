// src/components/UserDetailsForm.jsx
import React, { useState } from 'react';
import { db } from '../firebase-config';
import { doc, setDoc } from "firebase/firestore";
import rntuBack from '../assets/rntu-back.jpg';
import '../admin/admin.css';
import '../integration-styles.css';

// Country codes with their expected phone number length
const COUNTRY_CODES = [
    { code: '+91',  country: 'IN', name: 'India',          length: 10 },
    { code: '+263', country: 'ZW', name: 'Zimbabwe',       length: 9  },
    { code: '+1',   country: 'US', name: 'USA/Canada',     length: 10 },
    { code: '+44',  country: 'GB', name: 'UK',             length: 10 },
    { code: '+61',  country: 'AU', name: 'Australia',      length: 9  },
    { code: '+971', country: 'AE', name: 'UAE',            length: 9  },
    { code: '+966', country: 'SA', name: 'Saudi Arabia',   length: 9  },
    { code: '+92',  country: 'PK', name: 'Pakistan',       length: 10 },
    { code: '+880', country: 'BD', name: 'Bangladesh',     length: 10 },
    { code: '+94',  country: 'LK', name: 'Sri Lanka',      length: 9  },
    { code: '+977', country: 'NP', name: 'Nepal',          length: 10 },
    { code: '+65',  country: 'SG', name: 'Singapore',      length: 8  },
    { code: '+60',  country: 'MY', name: 'Malaysia',       length: 9  },
    { code: '+81',  country: 'JP', name: 'Japan',          length: 10 },
    { code: '+86',  country: 'CN', name: 'China',          length: 11 },
    { code: '+49',  country: 'DE', name: 'Germany',        length: 10 },
    { code: '+33',  country: 'FR', name: 'France',         length: 9  },
    // African Countries
    { code: '+234', country: 'NG', name: 'Nigeria',        length: 10 },
    { code: '+27',  country: 'ZA', name: 'South Africa',   length: 9  },
    { code: '+254', country: 'KE', name: 'Kenya',          length: 9  },
    { code: '+233', country: 'GH', name: 'Ghana',          length: 9  },
    { code: '+251', country: 'ET', name: 'Ethiopia',       length: 9  },
    { code: '+255', country: 'TZ', name: 'Tanzania',       length: 9  },
    { code: '+256', country: 'UG', name: 'Uganda',         length: 9  },
    { code: '+212', country: 'MA', name: 'Morocco',        length: 9  },
    { code: '+20',  country: 'EG', name: 'Egypt',          length: 10 },
    { code: '+213', country: 'DZ', name: 'Algeria',        length: 9  },
    { code: '+216', country: 'TN', name: 'Tunisia',        length: 8  },
    { code: '+237', country: 'CM', name: 'Cameroon',       length: 9  },
    { code: '+243', country: 'CD', name: 'DR Congo',       length: 9  },
    { code: '+225', country: 'CI', name: "Côte d'Ivoire",  length: 10 },
    { code: '+221', country: 'SN', name: 'Senegal',        length: 9  },
    { code: '+260', country: 'ZM', name: 'Zambia',         length: 9  },
    { code: '+258', country: 'MZ', name: 'Mozambique',     length: 9  },
    { code: '+250', country: 'RW', name: 'Rwanda',         length: 9  },
];

const UserDetailsForm = ({ user, onComplete }) => {
    const [formData, setFormData] = useState({
        name: user?.displayName || '',
        phone: '',
        purpose: '',
        organization: '',
        designation: ''
    });
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [countryCode, setCountryCode] = useState('+91'); // Default to India

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
        const { name, value } = e.target;
        let errors = { ...formErrors };

        if (name === 'name') {
            // Only allow letters and spaces
            if (value && !/^[a-zA-Z\s]+$/.test(value)) {
                errors.name = 'Full name can only contain letters and spaces.';
            } else {
                delete errors.name;
            }
        }

        if (name === 'phone') {
            const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);
            const expectedLength = selectedCountry ? selectedCountry.length : 10;
            // Only allow digits
            if (value && !/^\d+$/.test(value)) {
                errors.phone = 'Phone number must contain digits only.';
                return;
            } else if (value.length > expectedLength) {
                return; // Hard cap — block extra digits
            } else if (countryCode === '+91' && value.length > 0 && !/^[6-9]/.test(value)) {
                errors.phone = 'Indian phone numbers must start with 6, 7, 8, or 9.';
            } else if (value.length > 0 && value.length < expectedLength) {
                errors.phone = `Phone number must be exactly ${expectedLength} digits for ${selectedCountry?.name || 'this country'}.`;
            } else if (/^0+$/.test(value)) {
                errors.phone = 'Phone number cannot be all zeros.';
            } else {
                delete errors.phone;
            }
        }

        setFormErrors(errors);
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Final validation before submit
        let finalErrors = { ...formErrors };
        const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);
        const expectedLength = selectedCountry ? selectedCountry.length : 10;

        if (!formData.phone || formData.phone.length !== expectedLength) {
             finalErrors.phone = `Phone number must be exactly ${expectedLength} digits for ${selectedCountry?.name || 'this country'}.`;
        }
        if (countryCode === '+91' && formData.phone && !/^[6-9]/.test(formData.phone)) {
             finalErrors.phone = 'Indian phone numbers must start with 6, 7, 8, or 9.';
        }
        if (formData.phone && /^0+$/.test(formData.phone)) {
             finalErrors.phone = 'Phone number cannot be all zeros.';
        }

        if (Object.keys(finalErrors).length > 0) {
            setFormErrors(finalErrors);
            return; // Just return, button should be disabled anyway, no annoying alert
        }
        setLoading(true);

        try {
            // Create/Update user document in 'users' collection
            await setDoc(doc(db, "users", user.uid), {
                ...formData,
                phone: `${countryCode} ${formData.phone}`, // store full number e.g. +91 9876543210
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

    // Calculate if form is valid to disable button
    const isFormValid = formData.name.trim() !== '' && 
                        formData.phone.trim() !== '' && 
                        formData.purpose.trim() !== '' && 
                        formData.organization.trim() !== '' && 
                        Object.keys(formErrors).length === 0;

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

            <form onSubmit={handleSubmit} className="login-glass-card" style={{ maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 className="login-heading" style={{ textAlign: 'center', marginBottom: '8px' }}>One Last Step</h2>
                <p className="login-desc" style={{ textAlign: 'center', marginBottom: '24px' }}>
                    Please complete your profile to continue.
                </p>

                <div className="login-form">
                    <div className="login-input-group">
                        <label className="login-label">Full Name</label>
                        <div className="login-input-wrapper">
                            <span className="login-input-icon">👤</span>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="login-input"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        {formErrors.name && <p style={{ color: '#fca5a5', fontSize: '0.8em', marginTop: '-4px', marginLeft: '6px' }}>{formErrors.name}</p>}
                    </div>

                    <div className="login-input-group">
                        <label className="login-label">Phone Number</label>
                        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                            <select
                                value={countryCode}
                                onChange={(e) => {
                                    setCountryCode(e.target.value);
                                    // Reset phone and errors on country change
                                    setFormData(prev => ({ ...prev, phone: '' }));
                                    setFormErrors(prev => { const e = {...prev}; delete e.phone; return e; });
                                }}
                                className="login-input"
                                style={{ maxWidth: '140px', flexShrink: 0, paddingLeft: '14px' }}
                            >
                                {COUNTRY_CODES.map(c => (
                                    <option key={c.code} value={c.code} style={{color: '#000'}}>{c.code} {c.country}</option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder={`${COUNTRY_CODES.find(c => c.code === countryCode)?.length || 10} digits`}
                                maxLength={COUNTRY_CODES.find(c => c.code === countryCode)?.length || 10}
                                className="login-input"
                                style={{ flex: 1, paddingLeft: '14px' }}
                            />
                        </div>
                        {formErrors.phone && <p style={{ color: '#fca5a5', fontSize: '0.8em', marginTop: '-4px', marginLeft: '6px' }}>{formErrors.phone}</p>}
                    </div>

                    <div className="login-input-group">
                        <label className="login-label">Purpose of Visit</label>
                        <select
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleChange}
                            required
                            className="login-input"
                            style={{ paddingLeft: '14px' }}
                        >
                            <option value="" style={{color: '#666'}}>Select Purpose</option>
                            {purposes.map(p => <option key={p} value={p} style={{color: '#000'}}>{p}</option>)}
                        </select>
                    </div>

                    <div className="login-input-group">
                        <label className="login-label">Organization / Institute</label>
                        <div className="login-input-wrapper">
                            <span className="login-input-icon">🏢</span>
                            <input
                                type="text"
                                name="organization"
                                value={formData.organization}
                                onChange={handleChange}
                                required
                                className="login-input"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    <div className="login-input-group">
                        <label className="login-label">Designation <span style={{ fontWeight: 'normal', fontSize: '0.8em', opacity: 0.7 }}>(Optional)</span></label>
                        <select
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            className="login-input"
                            style={{ paddingLeft: '14px' }}
                        >
                            <option value="" style={{color: '#666'}}>Select Designation</option>
                            {designations.map(d => <option key={d} value={d} style={{color: '#000'}}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <button
                        type="submit"
                        className="login-submit-btn"
                        style={{ 
                            width: '100%',
                            opacity: (!isFormValid || loading) ? 0.6 : 1,
                            cursor: (!isFormValid || loading) ? 'not-allowed' : 'pointer',
                        }}
                        disabled={!isFormValid || loading}
                    >
                        {loading ? <span className="login-spinner" /> : (
                            <>
                                <span>Continue to Map</span>
                                <span className="login-btn-arrow">→</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserDetailsForm;
