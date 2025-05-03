// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

// const firebaseConfig = {
//   apiKey: "AIzaSyDr-FwDJRbtj_x_99XB9SB6YSAzqUGTRxE",
//   authDomain: "iotproject-66dce.firebaseapp.com",
//   projectId: "iotproject-66dce",
//   storageBucket: "iotproject-66dce.firebasestorage.app",
//   messagingSenderId: "855765079214",
//   appId: "1:855765079214:web:b1cc409731b47763e5493f",
//   measurementId: "G-9TX4Y8FV77"
// };

// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// export { app }; // export the app for other parts of your app to use

// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Import the Auth module

// Firebase config from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyDr-FwDJRbtj_x_99XB9SB6YSAzqUGTRxE",
  authDomain: "iotproject-66dce.firebaseapp.com",
  projectId: "iotproject-66dce",
  storageBucket: "iotproject-66dce.firebasestorage.app",
  messagingSenderId: "855765079214",
  appId: "1:855765079214:web:b1cc409731b47763e5493f",
  measurementId: "G-9TX4Y8FV77"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);  // Initialize Auth service

export { auth };  // Export auth so it can be used in other parts of your app

