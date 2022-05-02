// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref as ref_db, set, get, child } from "firebase/database";
import { getStorage, ref as ref_storage, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { DEFUALT_PROFILE_PIC } from "./constants";

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
const dbRef = ref_db(database);
const storage = getStorage(app);

export const getCurrentUser = async (userId) => {
  snapshot = await get(child(dbRef, `users/` + userId))
  if (snapshot.exists()) {
    return snapshot.val();
  } 
  else {
    return {};
  }
}

// I think I'm just gonna make my firebase funcs here and export them
export const saveUserDetails = async (userId, name, username, email, profilePic) => {
  await set(ref_db(database, 'users/' + userId), {
    name: name,
    username: username,
    email: email,
    profilePic: profilePic
  });
}

export const getUsers = async () => {
  let snapshot = await get(child(dbRef, `users`))
  if (snapshot.exists()) {
    return snapshot.val();
  } 
  else {
    return [];
  }
}

export const uploadImageToStorage = async (uri, uid) => {
  const img = await fetch(uri);
  const bytes = await img.blob();

  let storageRef = ref_storage(storage, 'profilePic/' + uid);
  let snapshot = await uploadBytesResumable(storageRef, bytes);

  return (await getDownloadURL(storageRef));
}

// Helper because fetch isn't working for me... (nvm)
// function urlToBlob(url) {
//   return new Promise((resolve, reject) => {
//       var xhr = new XMLHttpRequest();
//       xhr.onerror = reject;
//       xhr.onreadystatechange = () => {
//           if (xhr.readyState === 4) {
//               resolve(xhr.response);
//           }
//       };
//       xhr.open('GET', url);
//       xhr.responseType = 'blob'; // convert type
//       xhr.send();
//   })
// }