import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, Providers } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [zoomAccessToken, setZoomAccessToken] = useState(localStorage.getItem('zoomAccessToken'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchZoomToken();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchZoomToken = async () => {
    try {
      const response = await fetch('https://hello-belly-flask-1.onrender.com/get_zoom_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      const accessToken = data.access_token;

      if (accessToken) {
        setZoomAccessToken(accessToken);
        localStorage.setItem('zoomAccessToken', accessToken);
        console.log('Zoom access token received:', accessToken);
      } else {
        console.error('Failed to fetch Zoom access token');
      }
    } catch (error) {
      console.error('Error obtaining Zoom token:', error);
    }
  };

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, Providers.google)
      .then(async (result) => {
        console.log('User signed in:', result.user);
      })
      .catch((error) => {
        console.error('Error signing in with Google:', error);
      });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out successfully');
        setZoomAccessToken(null);
        localStorage.removeItem('zoomAccessToken');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  return (
    <AuthContext.Provider value={{ user, zoomAccessToken, handleGoogleSignIn, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};