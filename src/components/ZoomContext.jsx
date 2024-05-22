import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, Providers } from '../firebase'; // Adjust the import path as necessary
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

export const ZoomContext = createContext();

export const ZoomProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [zoomAccessToken, setZoomAccessToken] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, Providers.google);
      const token = await result.user.getIdToken();
      setZoomAccessToken(token);
      setUser(result.user);
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setZoomAccessToken('');
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const response = await fetch('http://localhost:5000/get_zoom_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          setZoomAccessToken(data.access_token);
        } catch (error) {
          console.error('Error fetching Zoom access token:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ZoomContext.Provider value={{ user, zoomAccessToken, handleGoogleSignIn, handleSignOut }}>
      {children}
    </ZoomContext.Provider>
  );
};

export const useZoom = () => {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
};