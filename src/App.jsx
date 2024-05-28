import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import DoctorDashboard from './components/DoctorDashboard';
import MeetingScheduler from './components/MeetingScheduler';
import AdminOnboard from './components/AdminOnboard';
import PregnancyQA from './components/PregnancyQA';


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
          <Route path="FAQ" element={<PregnancyQA />} />
          <Route path="/admin/onboard" element={<AdminOnboard />} />
          <Route path="/schedule" element={<MeetingScheduler />} />
          <Route path="/doctor_dashboard" element={<DoctorDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;