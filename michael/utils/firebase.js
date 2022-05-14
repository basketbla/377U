// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref as ref_db, set, get, child, remove, push, update } from "firebase/database";
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

export const getCurrentUser = (userId) => {
  return get(child(dbRef, `users/` + userId));
}

// I think I'm just gonna make my firebase funcs here and export them
export const saveUserDetails = async (userId, name, username, phoneNumber, profilePic) => {
  await set(ref_db(database, 'users/' + userId), {
    name: name,
    username: username,
    phoneNumber: phoneNumber,
    profilePic: profilePic,
    isFree: true
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
export const setFBCalendar = (userId, calendar) => {
  return set(ref_db(database, `users/${userId}/calendar`), calendar);
}

export const getFBCalendar = async (userId) => {
  let snapshot = await get(ref_db(database, `users/${userId}/calendar`));
  if (snapshot.exists()) {
    return snapshot.val();
  } 
  else {
    return [];
  } 
}


export const setAvailability = (userId, availability) => {
  return set(ref_db(database, `users/${userId}/isFree`), availability);
}

export const getAvailability = (userId) => {
  return get(ref_db(database, `users/${userId}/isFree`));
}

export const uploadImageToStorage = async (uri, uid) => {
  console.log('in upload!')
  console.log(uri)
  const img = await fetch(uri);
  const bytes = await img.blob();

  let storageRef = ref_storage(storage, 'profilePic/' + uid);
  let snapshot = await uploadBytesResumable(storageRef, bytes);

  return (await getDownloadURL(storageRef));
}

export const updateProfilePic = async (uri, uid) => {
  return set(child(ref_db(database, 'users/' + uid), 'profilePic'), uri);
}

export const addFriendRequest = (requesterId, requesteeId) => {
  return set(ref_db(database, `friendRequests/${requesteeId}/${requesterId}`), true);
}

export const getFriendRequests = async (uid) => {
  return get(ref_db(database, `friendRequests/${uid}`));
}

export const addFriend = async (requesterId, requesteeId) => {
  await set(ref_db(database, `friends/${requesteeId}/${requesterId}`), true);
  await set(ref_db(database, `friends/${requesterId}/${requesteeId}`), true);
}

export const getFriends = (uid) => {
  return get(ref_db(database, `friends/${uid}`));
}

export const removeFriend = async (requesterId, requesteeId) => {
  console.log(requesterId, requesteeId);
  await remove(ref_db(database, `friends/${requesteeId}/${requesterId}`));
  await remove(ref_db(database, `friends/${requesterId}/${requesteeId}`));
}

export const removeFriendRequest = (requesterId, requesteeId) => {
  return remove(ref_db(database, `friendRequests/${requesteeId}/${requesterId}`));
}

export const addSentFriendRequest = (requesterId, requesteeId) => {
  return set(ref_db(database, `sentFriendRequests/${requesterId}/${requesteeId}`), true);
}

export const removeSentFriendRequest = (requesterId, requesteeId) => {
  return remove(ref_db(database, `sentFriendRequests/${requesterId}/${requesteeId}`));
}

export const getSentFriendRequests = (requesterId) => {
  return get(ref_db(database, `sentFriendRequests/${requesterId}`));
}

export const getGroup = (groupId) => {
  return get(ref_db(database, `groups/${groupId}`));
}

export const createGroup = async (groupId, selectedUsers, currUser, message) => {

  // Add group id to userGroups for each user in userIdList
  const usersObj = {};
  const updates = {};
  // let groupName = '';
  for (const user of selectedUsers) {
    usersObj[user.id] = true;
    updates['/userGroups/' + user.id + '/' + groupId] = true;
    // if (groupName === '') {
    //   groupName += user.name.substring(0, user.name.indexOf(' '));
    // }
    // else {
    //   groupName += ', ' + user.name.substring(0, user.name.indexOf(' '));
    // }
  }
  // Not sure if this is the best place to do this
  // if (groupName.length > 18) {
  //   groupName = groupName.substring(0, 18) + '...';
  // }
  usersObj[currUser.uid] = true;
  updates['/userGroups/' + currUser.uid + '/' + groupId] = true;
  
  // Leaving the group name stuff alone for now and just calling it 'new group'
  let groupName = 'New Group'
  updates[`groups/${groupId}/users/`] = usersObj;
  updates[`groups/${groupId}/name`] = groupName;
  await update(ref_db(database), updates);

  // await set(ref_db(database, `groups/${groupId}/users/`), usersObj);

  await push(ref_db(database, `groups/${groupId}/messages`), {
    text: message,
    createdAt: JSON.stringify(new Date()),
    user: {
      _id: currUser.uid,
      name: currUser.name,
      avatar: currUser.profilePic,
    },
  });
}

export const addMessage = async (groupId, currUser, message) => {
  await push(ref_db(database, `groups/${groupId}/messages`), {
    text: message,
    createdAt: JSON.stringify(new Date()),
    user: {
      _id: currUser.uid,
      name: currUser.name,
      avatar: currUser.profilePic,
    },
  });
}

// Takes in the giftedChat object
export const addMessageByObj = (groupId, message) => {
  // This leaves an _id on each message and I'm just gonna ignore it maybe? Idk
  return push(ref_db(database, `groups/${groupId}/messages`), {
    ...message,
    createdAt: JSON.stringify(new Date())
  });
}

export const getUserGroups = async (uid) => {
  let groupIdSnapshot = await get(ref_db(database, `userGroups/${uid}`));
  if (groupIdSnapshot.exists()) {
    let groupIds = Object.keys(groupIdSnapshot.val());
    let groups = [];
    // This is slow but I don't know a better way
    // Could store metadata inside of usergroups? But then would be hard to keep updated / get free users
    // Could fetch all groups and then get the shiyt from there. This also feels bad

    // No, definitely just add more metadata, cuz group has messages. Change this!!!
    // TODO: add enough shiyt in metadata (like users) to display on home. 
    // Or keep it like this and don't re-fetch group data when going to chat
    for (let id of groupIds) {
      let groupSnapshot = await get(ref_db(database, `groups/${id}`));
      groups.push({...groupSnapshot.val(), id: id});
    }
    return groups
  }
  else {
    return [];
  }
}

export const updateGroupName = (groupId, newName) => {
  return set(ref_db(database, `groups/${groupId}/name`), newName);
}



// addFriendRequest('1', 'L5CTIRTqqiOp1QkqqcLsWJMva733');
// addFriend('1', 'L5CTIRTqqiOp1QkqqcLsWJMva733');
// removeFriend('1', 'L5CTIRTqqiOp1QkqqcLsWJMva733');
// addFriend('9C5cQbqtM2fKOXZZl34xFty8Iee2', 'L5CTIRTqqiOp1QkqqcLsWJMva733')
// addFriend('01WsqejuQ4esSapZysaarwvFFks1', 'L5CTIRTqqiOp1QkqqcLsWJMva733')
// removeSentFriendRequest('L5CTIRTqqiOp1QkqqcLsWJMva733', '9C5cQbqtM2fKOXZZl34xFty8Iee2');


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