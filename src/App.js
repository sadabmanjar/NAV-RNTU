import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, googleProvider, db } from './firebase-config';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Components
import Navbar from './components/Navbar';
import FrontPage from './components/FrontPage';
import UserDetailsForm from './components/UserDetailsForm';
import ContactUs from './components/ContactUs';
import MapPage from './components/MapPage';

// Styles
import './integration-styles.css';
import './App.css'; // Keep global styles

function App() {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user has already filled details
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          setUserDetails(null);
        }
      } else {
        setUserDetails(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserDetails(null);
  };

  const refreshUserDetails = async () => {
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setUserDetails(docSnap.data());
    }
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0', color: '#333' }}>Loading...</div>;

  return (
    <Router>
      <div className="app-container">
        {/* Navbar is always visible if logged in, or handles its own visibility */}
        {/* Actually Navbar in source code took user prop, might render differently */}
        <Navbar user={user} onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={
            !user ? (
              // Case 1: Not Logged In -> Show FrontPage
              <FrontPage onLogin={handleLogin} />
            ) : !userDetails ? (
              // Case 2: Logged In but No Details -> Show Form
              <UserDetailsForm user={user} onComplete={refreshUserDetails} />
            ) : (
              // Case 3: Logged In & Details exist -> Show Map Page
              <MapPage />
            )
          } />

          <Route path="/contact" element={<ContactUs />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
