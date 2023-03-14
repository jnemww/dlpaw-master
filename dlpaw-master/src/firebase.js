import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

import { FirebaseApp } from "@firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA17Bc2iCKf1TvPd6uYey2-j-AAn97MZ5U",
  authDomain: "donkleaguedataservices.firebaseapp.com",
  databaseURL: "https://donkleaguedataservices-default-rtdb.firebaseio.com",
  projectId: "donkleaguedataservices",
  storageBucket: "donkleaguedataservices.appspot.com",
  messagingSenderId: "409762083746",
  appId: "1:409762083746:web:ebf6b538d1aaa4fe9278fb",
  measurementId: "G-45D0JKEVW3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
