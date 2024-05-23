import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, Providers } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

export const ZoomContext = createContext();

export const ZoomProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [zoomAccessToken, setZoomAccessToken] = useState('');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed. Current user:', currentUser);
      setUser(currentUser);
      if (currentUser) {
        try {
          const response = await fetch('http://localhost:5000/get_zoom_token', { method: 'POST' });
          const data = await response.json();
          setZoomAccessToken(data.access_token);
          console.log('Zoom token retrieved:', data.access_token);
          fetchAppointments(currentUser.email);
        } catch (error) {
          console.error('Error fetching Zoom token:', error);
        }
      } else {
        setAppointments([]); // Clear appointments on signout
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAppointments = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setAppointments(data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('Attempting Google sign-in...');
      const result = await signInWithPopup(auth, Providers.google);
      console.log('Google sign-in successful');
      const token = await result.user.getIdToken();
      setZoomAccessToken(token);
      console.log('Zoom token set:', token);
    } catch (error) {
      console.error('Error during Google sign-in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('Sign-out successful');
      setUser(null);
      setZoomAccessToken('');
      setAppointments([]); // Clear appointments on signout
      localStorage.removeItem('zoomAccessToken');
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  return (
    <ZoomContext.Provider value={{ user, zoomAccessToken, appointments, setAppointments, handleGoogleSignIn, handleSignOut }}>
      {children}
    </ZoomContext.Provider>
  );
};

export const useZoom = () => useContext(ZoomContext);