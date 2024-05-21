import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, Providers } from '../firebase'; // Adjust the import path as necessary
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import './Navbar.css';
import { useZoom } from './ZoomContext'; // Adjust the import path as necessary

const Navbar = () => {
  const { user, zoomAccessToken, handleGoogleSignIn, handleSignOut } = useZoom();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('User signed in:', currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateMeeting = () => {
    navigate('/create_meeting', { state: { accessToken: zoomAccessToken } });
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