import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../CSS/Navbar.css";
import { useZoom } from "./ZoomContext";

const Navbar = () => {
  const { user, handleGoogleSignIn, handleSignOut, isDoctor } = useZoom();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("User signed in:", currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateMeeting = () => {
    navigate("/schedule");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="https://res.cloudinary.com/dhgpf6985/image/upload/v1718137984/Group_3_1_g9ar16.png" alt="Logo" className="colored-logo" />
      </div>
      <div className="navbar-user-welcome">
        {user ? (
          <div className="navbar-user-info">
            <span className="navbar-user-name">Welcome, {user.displayName}!</span>
          </div>
        ) : (
          <button className="navbar-button" onClick={handleGoogleSignIn}>
            Sign In with Google
          </button>
        )}
      </div>
      <div className="navbar-links">
        <Link className="navbar-link" to="/">
          Home
        </Link>
        <Link className="navbar-link" to="/about">
          About
        </Link>
        <Link className="navbar-link" to="/GroupClasses">
          Group Classes
        </Link>
        <Link className="navbar-link" to="/Dashboard">
          Dashboard
        </Link>
        {user && (
          <Link className="navbar-link" to="/chat">
            Messaging
          </Link>
        )}
        {user && user.email === "torcsh30@gmail.com" && (
          <Link className="navbar-link" to="/Admin">
            Admin Page
          </Link>
        )}
        {isDoctor && (
          <Link className="navbar-link" to="/doctor_dashboard">
            Doctor Dashboard
          </Link>
        )}
      </div>
      {user && (
        <button className="navbar-button" onClick={handleSignOut}>
          Sign Out
        </button>
      )}
    </nav>
  );
};

export default Navbar;