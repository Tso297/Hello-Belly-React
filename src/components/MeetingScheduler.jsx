import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useZoom } from './ZoomContext';  // Assuming you have a context to manage user information

const MeetingScheduler = () => {
  const { user, handleSignOut, appointments, setAppointments } = useZoom();  // Get the currently signed-in user and sign-out function
  const [selectedDate, setSelectedDate] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [doctor, setDoctor] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAppointments(user.email);  // Fetch appointments for the logged-in user
    }
  }, [user]);

  const fetchAppointments = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments?email=${email}`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const meetingData = {
      date: selectedDate,
      purpose,
      doctor,
      email: user.email,  // Use the email of the currently signed-in user
    };

    const url = editingAppointment
      ? `http://localhost:5000/api/appointments/${editingAppointment.id}?email=${user.email}`
      : `http://localhost:5000/api/schedule_meeting?email=${user.email}`;
    const method = editingAppointment ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      if (response.ok) {
        alert(`Meeting ${editingAppointment ? 'updated' : 'scheduled'} successfully!`);
        setEditingAppointment(null);
        setSelectedDate(null);
        setPurpose('');
        setDoctor('');
        fetchAppointments(user.email);  // Refresh appointments list
      } else {
        alert('Error scheduling/updating meeting');
      }
    } catch (error) {
      console.error('Error scheduling/updating meeting:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${id}?email=${user.email}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Meeting deleted successfully!');
        fetchAppointments(user.email);  // Refresh appointments list
      } else {
        alert('Error deleting meeting');
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setSelectedDate(new Date(appointment.date));
    setPurpose(appointment.purpose);
    setDoctor(appointment.doctor);
  };

  // Initialize minTime and maxTime as Date objects
  const minTime = new Date();
  minTime.setHours(9, 0);
  const maxTime = new Date();
  maxTime.setHours(17, 0);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Date and Time:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showTimeSelect
            timeIntervals={30}
            timeCaption="Time"
            dateFormat="MMMM d, yyyy h:mm aa"
            minTime={minTime}
            maxTime={maxTime}
            minDate={new Date()}  // Prevent selecting past dates
            inline
          />
        </div>
        <div>
          <label>Purpose of Meeting:</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Select Doctor:</label>
          <select value={doctor} onChange={(e) => setDoctor(e.target.value)} required>
            <option value="">Select a Doctor</option>
            <option value="doctor1">Doctor 1</option>
            <option value="doctor2">Doctor 2</option>
          </select>
        </div>
        <button type="submit">{editingAppointment ? 'Update Meeting' : 'Schedule Meeting'}</button>
      </form>

      <h2>Existing Appointments</h2>
      <ul>
        {appointments.map(appointment => (
          <li key={appointment.id}>
            {new Date(appointment.date).toLocaleString()} - {appointment.purpose} with {appointment.doctor}
            <div>
              <a href={appointment.meeting_url} target="_blank" rel="noopener noreferrer">Join Meeting</a>
            </div>
            <button onClick={() => handleEdit(appointment)}>Edit</button>
            <button onClick={() => handleDelete(appointment.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={() => {
        handleSignOut();
        setAppointments([]);  // Clear appointments on sign-out
      }}>Sign Out</button> {/* Add a sign-out button */}
    </div>
  );
};

export default MeetingScheduler;