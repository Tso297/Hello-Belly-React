import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, Providers } from '.././firebase'; // Adjust the import path as necessary
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, Providers.google)
      .then(async (result) => {
        const user = result.user;
        console.log('User signed in:', user);

        const idToken = await user.getIdToken();
        console.log('Firebase ID token:', idToken);

        // Combine the Zoom token generation step with the Google sign-in
        fetch('http://localhost:5000/get_zoom_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Zoom token process initiated:', data);
            const accessToken = data.access_token;

            // Handle the received access token as needed
            console.log('Zoom access token received:', accessToken);
            // You can store this token in state or context if needed
          })
          .catch((error) => {
            console.error('Error obtaining Zoom token:', error);
          });
      })
      .catch((error) => {
        console.error('Error signing in with Google:', error);
      });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out successfully');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
      <div>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> | <Link to="/consultation">Consultation</Link>
      </div>
      <div>
        {user ? (
          <div>
            <span>{user.displayName}</span>
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