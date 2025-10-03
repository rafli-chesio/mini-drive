// Import fungsi yang diperlukan dari URL CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZ-xuh2E7pMHkcRPo9BuxlwFWIuEAk5LI",
  authDomain: "mini-drive-4319f.firebaseapp.com",
  projectId: "mini-drive-4319f",
  storageBucket: "mini-drive-4319f.firebasestorage.app",
  messagingSenderId: "217170503022",
  appId: "G-17M5XMS7GX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);