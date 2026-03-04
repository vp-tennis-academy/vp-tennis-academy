import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBToQ24QTFhV5aqZfeRg_6pY49YTgcMQR0",
    authDomain: "app-generator-f2701.firebaseapp.com",
    databaseURL: "https://app-generator-f2701-default-rtdb.firebaseio.com",
    projectId: "app-generator-f2701",
    storageBucket: "app-generator-f2701.firebasestorage.app",
    messagingSenderId: "118135865945",
    appId: "1:118135865945:web:c301ce379d98cf86f46748"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
