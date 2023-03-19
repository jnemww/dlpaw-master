import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const pe = process.env;
const firebaseConfig = {
  apiKey: pe.REACT_APP_APIKEY,
  authDomain: pe.REACT_APP_AUTHDOMAIN,
  databaseURL: pe.REACT_APP_DATABASEURL,
  projectId: pe.REACT_APP_PROJECTID,
  storageBucket: pe.REACT_APP_STORAGEBUCKET,
  messagingSenderId: pe.REACT_APP_MESSAGINGSENDERID,
  appId: pe.REACT_APP_APPID,
  measurementId: pe.REACT_APP_MEASUREMENTID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
