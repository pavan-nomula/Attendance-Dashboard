// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAojKpBOyT7H4Dfrvp90pij2UML53rIyZU",
  authDomain: "smart-attendance-57d95.firebaseapp.com",
  databaseURL: "https://smart-attendance-57d95-default-rtdb.firebaseio.com",
  projectId: "smart-attendance-57d95",
  storageBucket: "smart-attendance-57d95.firebasestorage.app",
  messagingSenderId: "188765793073",
  appId: "1:188765793073:web:2527353caa62d54cc29e10",
  measurementId: "G-DRHTW6XT14"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔐 AUTH (THIS WAS MISSING)
export const auth = getAuth(app);

// 📦 REALTIME DATABASE
export const db = getDatabase(app);

// (optional)
export default app;
