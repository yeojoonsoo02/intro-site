// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0SEgiLTh9jpUg5Ca-yLnBQ6aK85b4oDw",
  authDomain: "intro-site-e88aa.firebaseapp.com",
  projectId: "intro-site-e88aa",
  storageBucket: "intro-site-e88aa.firebasestorage.app",
  messagingSenderId: "899682203152",
  appId: "1:899682203152:web:958e9a308ccb1f3655bc95",
  measurementId: "G-HNBGJ6GG9E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);