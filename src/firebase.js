import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDSqZ0IL4fBvOESyC927xhJrzOf1fcXGmI",
  authDomain: "consumo-de-energia-b9b28.firebaseapp.com",
  projectId: "consumo-de-energia-b9b28",
  storageBucket: "consumo-de-energia-b9b28.appspot.com",
  messagingSenderId: "318300945007",
  appId: "1:318300945007:web:0d85cb4011ebd806b22b9a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database
const db = getDatabase(app);

export { db };
export default app;
