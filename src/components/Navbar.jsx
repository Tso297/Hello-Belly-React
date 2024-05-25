import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './Navbar.css';
import { useZoom } from './ZoomContext';

const Navbar = () => {
    const { user, handleGoogleSignIn, handleSignOut, isDoctor } = useZoom();
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
        navigate('/schedule');
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
            <div>
                <Link to="/">Home</Link> | <Link to="/about">About</Link>
                {user && user.email === 'torcsh30@gmail.com' && (
                    <> | <Link to="/admin/onboard">Onboard Doctor</Link></>
                )}
                {isDoctor && (
                    <> | <Link to="/doctor_dashboard">Doctor Dashboard</Link></>
                )}
            </div>
            <div>
                {user ? (
                    <div>
                        <span>{user.displayName}</span>
                        <button onClick={handleCreateMeeting}>Schedule a Meeting</button>
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