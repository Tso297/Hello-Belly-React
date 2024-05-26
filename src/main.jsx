import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ZoomProvider } from "./components/ZoomContext.jsx";
import { AuthProvider } from "./components/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ZoomProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ZoomProvider>
  </React.StrictMode>
);
