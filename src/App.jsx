import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import DoctorDashboard from "./components/DoctorDashboard";
import MeetingScheduler from "./components/MeetingScheduler";
import AdminOnboard from "./components/AdminOnboard";
import PregnancyQA from "./components/PregnancyQA";
import ClassCalendar from "./components/ClassCalendar";
import AddClassForm from "./components/AddClassForm";
import GoogleMapsComponent from "./components/GoogleMapsComponent";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./components/Dashboard";
import ChatPage from "./components/ChatPage";
import About from "./components/About";
import GroupClasses from "./components/GroupClasses";
import Admin from "./components/Admin";

function App() {
  const [meeting, setMeeting] = useState(null);

  const handleMeetingCreated = (meetingData) => {
    setMeeting(meetingData);
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/GoogleMaps"
            element={
              <ErrorBoundary>
                <GoogleMapsComponent />
              </ErrorBoundary>
            }
          />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Classes" element={<ClassCalendar />} />
          <Route path="/About" element={<About />} />
          <Route path="/AddClasses" element={<AddClassForm />} />
          <Route path="/GroupClasses" element={<GroupClasses />} />
          <Route path="/FAQ" element={<PregnancyQA />} />
          <Route path="/Admin" element={<Admin />} />
          <Route path="/admin/onboard" element={<AdminOnboard />} />
          <Route path="/schedule" element={<MeetingScheduler />} />
          <Route path="/doctor_dashboard" element={<DoctorDashboard />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
