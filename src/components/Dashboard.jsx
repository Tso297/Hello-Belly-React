import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ClassCalendar from './ClassCalendar';
import PregnancyQA from './PregnancyQA';
import GoogleMapsComponent from './GoogleMapsComponent';
import MeetingScheduler from './MeetingScheduler';
import ChatPage from './ChatPage';
import DatePicker from 'react-datepicker';
import { useZoom } from './ZoomContext';
import '../CSS/Dashboard.css';

const Dashboard = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [isRescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const { user, appointments, setAppointments } = useZoom();
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentAppointmentIndex, setCurrentAppointmentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const openChatModal = () => setChatModalOpen(true);
  const closeChatModal = () => setChatModalOpen(false);

  const openRescheduleModal = (appointment) => {
    setRescheduleAppointment(appointment);
    setSelectedDate(new Date(appointment.date));
    setRescheduleModalOpen(true);
    fetchAvailableSlots(appointment.doctor.id, new Date(appointment.date));
  };

  const closeRescheduleModal = () => {
    setRescheduleModalOpen(false);
    setRescheduleAppointment(null);
    setSelectedDate(null);
    setAvailableSlots([]);
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/available_slots?doctor_id=${doctorId}&date=${date.toISOString().split('T')[0]}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      const availableDates = data.available_slots.map(slot => new Date(slot));
      setAvailableSlots(availableDates);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    }
  };

  const fetchAppointments = async () => {
    if (user) {
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
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

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
        fetchAppointments();
      } else {
        alert('Error canceling meeting');
      }
    } catch (error) {
      console.error('Error canceling meeting:', error);
    }
  };

  const handleReschedule = async () => {
    if (!selectedDate) {
      alert('Please select a new date and time for rescheduling');
      return;
    }

    const meetingData = {
      date: selectedDate.toISOString(),
    };

    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/appointments/${rescheduleAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      if (response.ok) {
        alert('Meeting rescheduled successfully!');
        fetchAppointments();
        closeRescheduleModal();
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
      }, 500);
    }, 500);
  };

  const showNextAppointment = () => {
    setSlideDirection('right-exit');
    setTimeout(() => {
      setCurrentAppointmentIndex((prevIndex) => (prevIndex + 1) % appointments.length);
      setSlideDirection('right-enter');
      setTimeout(() => {
        setSlideDirection('animate');
      }, 500);
    }, 500);
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
                    <h3>{appointments[currentAppointmentIndex]?.title}</h3>
                    <p>Date and Time: {appointments[currentAppointmentIndex]?.date ? new Date(appointments[currentAppointmentIndex]?.date).toLocaleString() : 'N/A'}</p>
                    <p>Purpose: {appointments[currentAppointmentIndex]?.purpose}</p>
                    <p>Consultant: {appointments[currentAppointmentIndex]?.doctor?.name}</p>
                    <p>Join Link: <a href={`https://meet.jit.si/${appointments[currentAppointmentIndex]?.id}`} target="_blank" rel="noopener noreferrer">Join Meeting</a></p>
                    <button onClick={() => handleCancel(appointments[currentAppointmentIndex]?.id)}>Cancel</button>
                    <button onClick={() => openRescheduleModal(appointments[currentAppointmentIndex])}>Reschedule</button>
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
          <button className="dashboard-action-button" onClick={openChatModal}>Chat with provider</button>
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
      {isChatModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeChatModal}>&times;</span>
            <ChatPage closeModal={closeChatModal} />
          </div>
        </div>
      )}
      {isRescheduleModalOpen && rescheduleAppointment && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeRescheduleModal}>&times;</span>
            <h2>Reschedule Appointment</h2>
            <p>Current Date and Time: {new Date(rescheduleAppointment.date).toLocaleString()}</p>
            <label>New Date and Time:</label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              showTimeSelect
              timeIntervals={30}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              includeTimes={availableSlots}
            />
            <button onClick={handleReschedule}>Confirm Reschedule</button>
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