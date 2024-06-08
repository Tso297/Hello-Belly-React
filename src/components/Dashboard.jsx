import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ClassCalendar from './ClassCalendar'; // Assuming this combines appointments and classes
import PregnancyQA from './PregnancyQA'; // Chatbox and videos related to the chat topic
import GoogleMapsComponent from './GoogleMapsComponent';
import MeetingScheduler from './MeetingScheduler';
import { useZoom } from './ZoomContext';
import '../CSS/Dashboard.css';

const Dashboard = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { user, appointments, setAppointments } = useZoom();
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentAppointmentIndex, setCurrentAppointmentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    if (user) {
      const fetchAppointments = async () => {
        try {
          const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/appointments?email=${user.email}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          setAppointments(data.appointments);
        } catch (error) {
          console.error('Error fetching appointments:', error);
        }
      };

      fetchAppointments();
    }
  }, [user, setAppointments]);

  const handleCancel = async (id) => {
    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Meeting canceled successfully!');
        setAppointments((prevAppointments) => prevAppointments.filter((appointment) => appointment.id !== id));
        setCurrentAppointmentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else {
        alert('Error canceling meeting');
      }
    } catch (error) {
      console.error('Error canceling meeting:', error);
    }
  };

  const handleReschedule = async (id) => {
    if (!selectedDate) {
      alert('Please select a new date and time for rescheduling');
      return;
    }

    const meetingData = {
      date: selectedDate.toISOString(),
    };

    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      if (response.ok) {
        alert('Meeting rescheduled successfully!');
        setSelectedDate(null);
        setRescheduleAppointmentId(null);
        const updatedAppointment = await response.json();
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === id ? updatedAppointment : appointment
          )
        );
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error rescheduling meeting:', error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const showPreviousAppointment = () => {
    setSlideDirection('left-exit');
    setTimeout(() => {
      setCurrentAppointmentIndex((prevIndex) => (prevIndex - 1 + appointments.length) % appointments.length);
      setSlideDirection('left-enter');
      setTimeout(() => {
        setSlideDirection('animate');
      }, 500); // Duration should match the transition duration in CSS
    }, 500); // Duration should match the transition duration in CSS
  };

  const showNextAppointment = () => {
    setSlideDirection('right-exit');
    setTimeout(() => {
      setCurrentAppointmentIndex((prevIndex) => (prevIndex + 1) % appointments.length);
      setSlideDirection('right-enter');
      setTimeout(() => {
        setSlideDirection('animate');
      }, 500); // Duration should match the transition duration in CSS
    }, 500); // Duration should match the transition duration in CSS
  };

  return (
    <div className="dashboard">
      <Navbar className="dashboard-navbar" />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <div className="dashboard-calendar">
            <div className="dashboard-calendar-header">
              <h2>Your Schedule</h2>
              <div className="dashboard-calendar-actions">
              </div>
              <ul className="calendar-legend">
                <li><span className="appointments-marker"></span></li>
                <li><span className="classes-marker"></span></li>
                </ul>
            </div>
            <ClassCalendar />
          </div>
          <div className="dashboard-resources">
            <PregnancyQA />
          </div>
          <div className="dashboard-upcoming-appointments">
            <h2 className="dashboard-appointments-header">
              Upcoming Appointments <span className="appointments-count">{appointments.length}</span>
            </h2>
            <div className="appointments-list">
              {appointments.length === 0 ? (
                <p>No upcoming appointments</p>
              ) : (
                <>
                  <button onClick={showPreviousAppointment} className="carousel-button carousel-button-left">←</button>
                  <div className={`appointment-item ${slideDirection === 'left-exit' ? 'left-exit' : slideDirection === 'left-enter' ? 'left-enter' : slideDirection === 'right-exit' ? 'right-exit' : slideDirection === 'right-enter' ? 'right-enter' : 'animate'}`}>
                    <h3>{appointments[currentAppointmentIndex].title}</h3>
                    <p>Date and Time: {new Date(appointments[currentAppointmentIndex].date).toLocaleString()}</p>
                    <p>Purpose: {appointments[currentAppointmentIndex].purpose}</p>
                    <p>Doctor: Dr. {appointments[currentAppointmentIndex].doctor.name}</p>
                    <p>Join Link: <a href={`https://meet.jit.si/${appointments[currentAppointmentIndex].id}`} target="_blank" rel="noopener noreferrer">Join Meeting</a></p>
                    <button onClick={() => handleCancel(appointments[currentAppointmentIndex].id)}>Cancel</button>
                    <button onClick={() => setRescheduleAppointmentId(appointments[currentAppointmentIndex].id)}>Reschedule</button>
                    {rescheduleAppointmentId === appointments[currentAppointmentIndex].id && (
                      <div>
                        <label>Reschedule Date and Time:</label>
                        <DatePicker
                          selected={selectedDate}
                          onChange={handleDateChange}
                          showTimeSelect
                          timeIntervals={30}
                          timeCaption="Time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                        <button onClick={() => handleReschedule(appointments[currentAppointmentIndex].id)}>Confirm Reschedule</button>
                      </div>
                    )}
                  </div>
                  <button onClick={showNextAppointment} className="carousel-button carousel-button-right">→</button>
                </>
              )}
            </div>
          </div>
          <div className="dashboard-google-maps">
            <GoogleMapsComponent selectedPlace={selectedPlace} setSelectedPlace={setSelectedPlace} />
            <div className="map-legend">
              <h3>Legend</h3>
              <ul>
                <li><span className="hospital-marker"></span> Hospitals</li>
                <li><span className="womens-physicians-marker"></span> Women's Physicians</li>
                <li><span className="obgyn-marker"></span> OB-GYNs</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="dashboard-user-info">
          {/* User Info section */}
        </div>
        <div className="floating-buttons">
          <button className="dashboard-action-button" onClick={openModal}>Schedule a call</button>
          <button className="dashboard-action-button">Chat with provider</button>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>&times;</span>
            <MeetingScheduler closeModal={closeModal} />
          </div>
        </div>
      )}
      {selectedPlace && (
        <div className="info-window">
          <h2>{selectedPlace.name}</h2>
          {selectedPlace.photos && selectedPlace.photos[0] && (
            <img
              src={selectedPlace.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 })}
              alt={selectedPlace.name}
            />
          )}
          <p>{selectedPlace.vicinity}</p>
          {selectedPlace.formatted_phone_number && <p>Phone: {selectedPlace.formatted_phone_number}</p>}
          {selectedPlace.formatted_address && <p>Address: {selectedPlace.formatted_address}</p>}
          {selectedPlace.website && (
            <p>
              Website: <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer">{selectedPlace.website}</a>
            </p>
          )}
          {selectedPlace.opening_hours && (
            <p>
              Hours: {selectedPlace.opening_hours.weekday_text.join(', ')}
            </p>
          )}
          <button onClick={() => setSelectedPlace(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;