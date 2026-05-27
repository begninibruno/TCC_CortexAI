// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEdLf9xTXRQmyC98P5vFY4GKgZX0pTy3g",
  authDomain: "cortexai-5add6.firebaseapp.com",
  projectId: "cortexai-5add6",
  storageBucket: "cortexai-5add6.firebasestorage.app",
  messagingSenderId: "543085453304",
  appId: "1:543085453304:web:4438f299706d7a8e96400d",
  measurementId: "G-HKNHGC6R05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);