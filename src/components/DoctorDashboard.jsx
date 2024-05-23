import React, { useState, useEffect } from 'react';
import { useZoom } from './ZoomContext';

const DoctorDashboard = () => {
  const { user } = useZoom();  // Get the currently signed-in user
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (user && (user.email === 'doctor1@example.com' || user.email === 'doctor2@example.com')) {
      fetchAppointments();  // Fetch appointments for the doctor
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctor_appointments`, {
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

  return (
    <div>
      <h2>Doctor's Appointments</h2>
      <ul>
        {appointments.map(appointment => (
          <li key={appointment.id}>
            {new Date(appointment.date).toLocaleString()} - {appointment.purpose} with {appointment.user_email}
            <div>
              <a href={appointment.moderator_url} target="_blank" rel="noopener noreferrer">Join Meeting as Moderator</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorDashboard;