import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import DoctorDashboard from './components/DoctorDashboard';
import MeetingDetails from './components/MeetingDetails';
import DoctorPatientSession from './components/DoctorPatientSession';
import GroupClassSession from './components/GroupClassSession';
import MeetingScheduler from './components/MeetingScheduler';


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
          <Route path="/schedule" element={<MeetingScheduler />} />
          <Route path="/doctor_dashboard" component={DoctorDashboard} />
          <Route path="/meeting-details" element={<MeetingDetails meeting={meeting} />} />
          <Route path="/doctor-session" element={<DoctorPatientSession 
            meetingNumber={meeting?.id} 
            userName="Patient Name" 
            userEmail="patient@example.com"
          />} />
          <Route path="/group-class" element={<GroupClassSession 
            meetingNumber={meeting?.id} 
            userName="Class Participant"
          />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;