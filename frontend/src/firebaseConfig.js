// src/firebaseConfig.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDO1dIPlLIRSW3WGoX1MNiv0nfmJZhCSbI",
    authDomain: "bookingapp-f6962.firebaseapp.com",
    projectId: "bookingapp-f6962",
    storageBucket: "bookingapp-f6962.firebasestorage.app",
    messagingSenderId: "25174112196",
    appId: "1:25174112196:web:5c323ee3073e21958ad691",
    measurementId: "G-83DY7N22X3"
  }

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };