import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDbnO_HCc0t6bIC9A1u_ogN6P1k-dmqGzY",
    authDomain: "nav-rntu.firebaseapp.com",
    projectId: "nav-rntu",
    storageBucket: "nav-rntu.firebasestorage.app",
    messagingSenderId: "713722825839",
    appId: "1:713722825839:web:42dd53008a9218f9eb119a",
    measurementId: "G-B13HY1KFTY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);