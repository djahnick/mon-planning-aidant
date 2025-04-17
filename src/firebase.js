// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Ta configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA_ZypiaRGqxEr7WGFCRsGlKRwft5SHK0w",
  authDomain: "mon-planning-aidant.firebaseapp.com",
  projectId: "mon-planning-aidant",
  storageBucket: "mon-planning-aidant.firebasestorage.app",
  messagingSenderId: "135066579618",
  appId: "1:135066579618:web:85804f4a5d3fa937371dfb"
};

// Initialisation de l'app Firebase
const app = initializeApp(firebaseConfig);

// Export de la base Firestore
export const db = getFirestore(app);
