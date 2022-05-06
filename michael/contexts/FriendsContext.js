import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { 
  useContext,
  useState,
  useEffect
} from 'react';
import { auth } from '../utils/firebase'

const FriendsContext = React.createContext();

// This is just a wrapper so it looks cleaner when we use the auth context
export function useFriends() { 
  return useContext(FriendsContext);
}

// I've only done this in react not react native so hopefully it works the same
export function FriendsProvider({ children }) { 

  const [allExistingGlobal, setAllExistingGlobal] = useState([]);
  const [allFriendRequestsGlobal, setAllFriendRequestsGlobal] = useState([]);

  const value = {
    allExistingGlobal,
    setAllExistingGlobal,
    allFriendRequestsGlobal,
    setAllFriendRequestsGlobal
  }

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  )
}
