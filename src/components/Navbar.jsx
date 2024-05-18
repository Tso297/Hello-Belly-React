import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, Providers } from '../firebase'; // Adjust the import path as necessary
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
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
      const response = await fetch('http://localhost:5000/get_zoom_token', {
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

  async function handleCreateMeeting() {
    try {
        const response = await fetch('http://localhost:5000/api/create_meeting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${zoomAccessToken}`
            },
            credentials: 'include',
            body: JSON.stringify({
                topic: 'New Meeting',
                start_time: '2024-05-17T10:00:00Z',  // Example start time
                duration: 30
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create meeting');
        }

        const data = await response.json();
        console.log('Meeting created:', data);
    } catch (error) {
        console.error('Error creating meeting:', error);
    }
}

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
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
      <div>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> | <Link to="/create_meeting">Consultation</Link>
      </div>
      <div>
        {user ? (
          <div>
            <span>{user.displayName}</span>
            <button onClick={handleCreateMeeting}>Create Meeting</button>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        ) : (
          <button onClick={handleGoogleSignIn}>Sign In with Google</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;