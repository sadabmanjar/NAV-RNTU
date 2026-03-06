import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, googleProvider, db } from './firebase-config';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

// Assets
import rntuLogo from './assets/nav-rntu-logo.png';

// Components
import Navbar from './components/Navbar';
import FrontPage from './components/FrontPage';
import UserDetailsForm from './components/UserDetailsForm';
import ContactUs from './components/ContactUs';
import MapPage from './components/MapPage';
import EventsPage from './components/EventsPage';

// Admin Components
import AdminLayout from './admin/AdminLayout';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import Locations from './admin/Locations';
import Feedbacks from './admin/Feedbacks';
import Events from './admin/Events';
import Users from './admin/Users';
import Profile from './admin/Profile';
import ProtectedRoute from './admin/ProtectedRoute';

// Styles
import './integration-styles.css';
import './App.css'; // Keep global styles

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = window.location.pathname; // Naive check as useLocation requires Router context

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user was deleted by admin
        const deletedRef = doc(db, "deletedUsers", currentUser.uid);
        const deletedSnap = await getDoc(deletedRef);
        
        if (deletedSnap.exists()) {
          // Admin deleted this user's data. Force Google logout to truly disconnect them.
          await deleteDoc(deletedRef); // Clear flag so they can potentially register anew later
          await signOut(auth);
          setUser(null);
          setUserDetails(null);
          setLoading(false);
          return;
        }

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

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f4f6f9' }}>
        <img src={rntuLogo} alt="NAV-RNTU Logo" style={{ height: '80px', marginBottom: '20px', animation: 'logoPulse 1.5s ease-in-out infinite' }} />
        <style>
          {`
            @keyframes logoPulse {
              0% { opacity: 0.7; transform: scale(0.98); }
              50% { opacity: 1; transform: scale(1.02); }
              100% { opacity: 0.7; transform: scale(0.98); }
            }
          `}
        </style>
        <div style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: '500' }}>Loading Campus Navigation...</div>
      </div>
    );
  }

  const isAdminRoute = location.startsWith('/manage-system');

  return (
    <div className="app-container">
      {!isAdminRoute && <Navbar user={user} onLogout={handleLogout} />}

      <Routes>
        <Route path="/" element={
          !user ? (
            <FrontPage onLogin={handleLogin} />
          ) : !userDetails ? (
            <UserDetailsForm user={user} onComplete={refreshUserDetails} />
          ) : (
            <MapPage />
          )
        } />

        <Route path="/contact" element={<ContactUs />} />
        <Route path="/events" element={<EventsPage />} />

        {/* Admin Routes (Obfuscated) */}
        <Route path="/manage-system/login" element={<Login />} />
        <Route path="/manage-system" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/manage-system/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="locations" element={<Locations />} />
          <Route path="events" element={<Events />} />
          <Route path="feedbacks" element={<Feedbacks />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

// this will 
