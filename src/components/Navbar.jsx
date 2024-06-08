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
    <nav
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <div className="navbar-links">
        <Link className="navbar-link" to="/">
          Home
        </Link>
        <Link className="navbar-link" to="/about">
          About
        </Link>
        <Link className="navbar-link" to="/Dashboard">
          Dashboard
        </Link>
        {user && (
          <Link className="navbar-link" to="/chat">
            Messaging
          </Link>
        )}
        <Link className="navbar-link" to="/AddClasses">
          Add Classes
        </Link>
        {user && user.email === "torcsh30@gmail.com" && (
          <>
            {" "}
            <Link className="navbar-link" to="/admin/onboard">
              Onboard Doctor
            </Link>
          </>
        )}
        {isDoctor && (
          <>
            {" "}
            <Link className="navbar-link" to="/doctor_dashboard">
              Doctor Dashboard
            </Link>
          </>
        )}
      </div>
      <div className="navbar-user-actions">
        {user ? (
          <div className="navbar-user-info">
            <span className="navbar-user-name">{user.displayName}</span>
            <button className="navbar-button" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        ) : (
          <button className="navbar-button" onClick={handleGoogleSignIn}>
            Sign In with Google
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
