import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, Providers } from './firebase';
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

  const handleSignIn = () => {
    signInWithPopup(auth, Providers.google)
      .then((result) => {
        console.log('User signed in:', result.user);
      }).catch((error) => {
        console.error('Error signing in with Google:', error.message);
      });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out successfully');
      }).catch((error) => {
        console.error('Error signing out:', error.message);
      });
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
      <div>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> | <Link to="/consultation">Consultation</Link>
      </div>
      <div>
        {user ? (
          <button onClick={handleSignOut}>Sign Out</button>
        ) : (
          <button onClick={handleSignIn}>Sign In with Google</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;