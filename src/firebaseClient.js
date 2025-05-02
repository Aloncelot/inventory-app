import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBEiZQAiem5sCVcloqhXqVfy_IJu2D9ZQA",
  authDomain: "inventory-app-9469e.firebaseapp.com",
  projectId: "inventory-app-9469e",
  storageBucket: "inventory-app-9469e.firebasestorage.app",
  messagingSenderId: "554634884517",
  appId: "1:554634884517:web:fa722928aed0a681f1244c",
  measurementId: "G-N2K0EHWM6N",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
