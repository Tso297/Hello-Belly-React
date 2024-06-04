import React from 'react';
import Navbar from './Navbar';
import ClassCalendar from './ClassCalendar'; // Assuming this combines appointments and classes
import MeetingScheduler from './MeetingScheduler'; // Extract the upcoming appointments section
import PregnancyQA from './PregnancyQA'; // Chatbox and videos related to the chat topic
import GoogleMapsComponent from './GoogleMapsComponent';
import '.././CSS/Dashboard.css';

const Dashboard = () => {
    return (
      <div className="dashboard">
        <Navbar className="dashboard-navbar" />
        <div className="dashboard-main">
          <header className="dashboard-header">
            <h1 className="dashboard-title">Dashboard</h1>
          </header>
          <div className="dashboard-content">
            <div className="dashboard-calendar">
              <div className="dashboard-calendar-header">
                <h2>Your Schedule</h2>
                <div className="dashboard-calendar-actions">
                  <button className="dashboard-action-button">Schedule a call</button>
                  <button className="dashboard-action-button">Chat with provider</button>
                </div>
              </div>
              <ClassCalendar />
            </div>
            <div className="dashboard-resources">
              <h2>Resources</h2>
              <PregnancyQA />
            </div>
            <div className="dashboard-upcoming-appointments">
              <h2>Upcoming Appointments</h2>
              <MeetingScheduler section="appointments" />
            </div>
            <div className="dashboard-google-maps">
              <GoogleMapsComponent />
            </div>
          </div>
          <div className="dashboard-user-info">
            {/* User Info section */}
          </div>
        </div>
      </div>
    );
  };
  
  export default Dashboard;