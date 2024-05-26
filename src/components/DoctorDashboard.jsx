import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useZoom } from './ZoomContext';

const DoctorDashboard = () => {
  const { user, doctorId } = useZoom();
  const [appointments, setAppointments] = useState([]);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);

  useEffect(() => {
    if (user && doctorId) {
      fetchDoctorAppointments(doctorId);
    }
  }, [user, doctorId]);

  const fetchDoctorAppointments = async (doctorId) => {
    console.log('Fetching appointments for doctor ID:', doctorId);
    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/doctor_appointments?doctor_id=${doctorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      const adjustedAppointments = data.appointments.map(appointment => ({
        ...appointment,
        date: new Date(new Date(appointment.date).getTime() - 4 * 60 * 60 * 1000).toISOString(),
      }));
      setAppointments(adjustedAppointments);
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/appointments/${id}?email=${user.email}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Meeting canceled successfully!');
        fetchDoctorAppointments(doctorId);
      } else {
        alert('Error canceling meeting');
      }
    } catch (error) {
      console.error('Error canceling meeting:', error);
    }
  };

  const handleReschedule = async (id) => {
    if (!rescheduleDate) {
      alert('Please select a new date and time for rescheduling');
      return;
    }

    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/appointments/${id}?email=${user.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: rescheduleDate.toISOString() }),
      });

      if (response.ok) {
        alert('Meeting rescheduled successfully!');
        setRescheduleDate(null);
        setRescheduleAppointmentId(null);
        fetchDoctorAppointments(doctorId);
      } else {
        alert('Error rescheduling meeting');
      }
    } catch (error) {
      console.error('Error rescheduling meeting:', error);
    }
  };

  const handleRescheduleClick = (id) => {
    setRescheduleAppointmentId(id);
  };

  const minTime = new Date();
  minTime.setHours(9, 0);
  const maxTime = new Date();
  maxTime.setHours(17, 0);

  return (
    <div>
      <h2>Doctor Dashboard</h2>
      {appointments.length === 0 ? (
        <p>No appointments scheduled.</p>
      ) : (
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <p>Date and Time: {new Date(new Date(appointment.date).getTime() + 4 * 60 * 60 * 1000).toLocaleString()}</p>
              <p>Purpose: {appointment.purpose}</p>
              <p>User: {appointment.user.name}</p>
              <button onClick={() => handleCancel(appointment.id)}>Cancel</button>
              <button onClick={() => handleRescheduleClick(appointment.id)}>Reschedule</button>
              {rescheduleAppointmentId === appointment.id && (
                <div>
                  <label>Reschedule Date and Time:</label>
                  <DatePicker
                    selected={rescheduleDate}
                    onChange={(date) => setRescheduleDate(date)}
                    showTimeSelect
                    timeIntervals={30}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minTime={minTime}
                    maxTime={maxTime}
                    minDate={new Date()}
                  />
                  <button onClick={() => handleReschedule(appointment.id)}>Confirm Reschedule</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DoctorDashboard;