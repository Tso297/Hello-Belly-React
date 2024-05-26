import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, Providers } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { Firebase } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const db = getFirestore(Firebase);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUser({
            ...currentUser,
            role: userDoc.data().role,
            name: userDoc.data().name,
          });
        } else {
          // Set default role if the user document doesn't exist
          const newUser = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName,
            role: "patient", // Default role can be set here
          };
          await setDoc(doc(db, "users", currentUser.uid), newUser);
          setUser({ ...currentUser, role: newUser.role, name: newUser.name });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [db]);

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, Providers.google)
      .then(async (result) => {
        const userDoc = await getDoc(doc(db, "users", result.user.uid));
        if (userDoc.exists()) {
          setUser({
            ...result.user,
            role: userDoc.data().role,
            name: userDoc.data().name,
          });
        } else {
          // Set default role if the user document doesn't exist
          const newUser = {
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            role: "patient", // Default role can be set here
          };
          await setDoc(doc(db, "users", result.user.uid), newUser);
          setUser({ ...result.user, role: newUser.role, name: newUser.name });
        }
      })
      .catch((error) => {
        console.error("Error signing in with Google:", error);
      });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out successfully");
        setUser(null);
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <AuthContext.Provider value={{ user, handleGoogleSignIn, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};
