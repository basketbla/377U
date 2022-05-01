import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { 
  useContext,
  useState,
  useEffect
} from 'react';
import { auth } from '../utils/firebase'

const AuthContext = React.createContext();

// This is just a wrapper so it looks cleaner when we use the auth context
export function useAuth() { 
  return useContext(AuthContext);
}

// I've only done this in react not react native so hopefully it works the same
export function AuthProvider({ children }) { 

  const [currentUser, setCurrentUser] = useState();

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    })

    return unsubscribe;
  }, [])

  const value = {
    currentUser,
    signup,
    login
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
