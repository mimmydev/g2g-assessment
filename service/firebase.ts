// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_1rE2EtPuM3OnVHsS67KfaoXnMLrCDgM",
  authDomain: "g2g-assessment.firebaseapp.com",
  projectId: "g2g-assessment",
  storageBucket: "g2g-assessment.firebasestorage.app",
  messagingSenderId: "357615106100",
  appId: "1:357615106100:web:8d548c6b01c7a9d350f261",
  measurementId: "G-SY1TW7D11K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);