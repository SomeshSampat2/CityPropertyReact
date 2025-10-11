// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDUsQlLdCXeqmzvL8Dlx8Jr34IyVT-mOyM",
  authDomain: "cityproperty-78681.firebaseapp.com",
  projectId: "cityproperty-78681",
  storageBucket: "cityproperty-78681.firebasestorage.app",
  messagingSenderId: "299067451002",
  appId: "1:299067451002:web:863b6864e43d64f1edfdc3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase app initialized:", app.name);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
console.log("Firebase Auth initialized");

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
console.log("Firebase Firestore initialized");

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure auth to handle popup issues better
auth.settings.appVerificationDisabledForTesting = false;

export default app;
