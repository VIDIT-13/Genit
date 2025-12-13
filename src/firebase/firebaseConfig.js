// Firebase core
import { initializeApp } from "firebase/app";

// Firebase services you need
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFMJHIs7u-oxzl-IJAaKnzlXebaXwaBA0",
  authDomain: "janashvidit.firebaseapp.com",
  projectId: "janashvidit",
  storageBucket: "janashvidit.appspot.com", // you can leave it, not used now
  messagingSenderId: "760809879998",
  appId: "1:760809879998:web:b8abeba87dd80ba18221ef",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
