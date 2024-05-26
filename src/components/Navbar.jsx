import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./Navbar.css";
import { useZoom } from "./ZoomContext";

const Navbar = () => {
  const { user, zoomAccessToken, handleGoogleSignIn, handleSignOut } =
    useZoom();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("User signed in:", currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (zoomAccessToken) {
      console.log("Zoom access token updated:", zoomAccessToken);
      localStorage.setItem("zoomAccessToken", zoomAccessToken);
    }
  }, [zoomAccessToken]);

  const handleCreateMeeting = () => {
    navigate("/schedule", { state: { accessToken: zoomAccessToken } });
  };

  const handleSignInWithZoom = () => {
    window.location.href = "/login"; // Adjust as needed to hit your login endpoint
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <div>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
        {user && user.role === "doctor" && (
          <>
            {" "}
            | <Link to="/doctor_dashboard">Doctor Dashboard</Link>
          </>
        )}
        {user && (
          <>
            <Link to="/inbox">Inbox</Link>
            <Link to="/send-message">Compose Message</Link>
            <Link to="/sent-messages">Sent Messages</Link>
          </>
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
