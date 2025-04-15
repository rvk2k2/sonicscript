import { initializeApp } from "firebase/app";

import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBywBwsVQlh6PjUpq9MFjvpcIuab3JwqWY",
  authDomain: "sonicscript-fef5c.firebaseapp.com",
  projectId: "sonicscript-fef5c",
  storageBucket: "sonicscript-fef5c.firebasestorage.app",
  messagingSenderId: "120231542735",
  appId: "1:120231542735:web:d5e15a6cde6ab518d49cba",
  measurementId: "G-8CMCDESBWZ"
};


const app = initializeApp(firebaseConfig);


const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };