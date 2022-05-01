// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, get, child } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_IwyT48ZP56E8LkpR9vKxbhGj464O7-8",
  authDomain: "michael-b65b3.firebaseapp.com",
  projectId: "michael-b65b3",
  storageBucket: "michael-b65b3.appspot.com",
  messagingSenderId: "454609421610",
  appId: "1:454609421610:web:f77caefc3a73d76dd80a53",
  measurementId: "G-0YN0GGNEF0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getDatabase();
const dbRef = ref(database);

// I think I'm just gonna make my firebase funcs here and export them
export const saveName = async (userId, name) => {
  await set(ref(database, 'users/' + userId), {
    name: name
  });
}

export const getUsers = async () => {
  snapshot = await get(child(dbRef, `users`))
  if (snapshot.exists()) {
    return snapshot.val();
  } 
  else {
    return [];
  }
}
