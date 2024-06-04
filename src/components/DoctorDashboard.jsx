import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useZoom } from './ZoomContext';

const DoctorDashboard = () => {
  const { user, handleSignOut, doctorId } = useZoom();
  const [appointments, setAppointments] = useState([]);
  const [timeOffs, setTimeOffs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);
  const [timeOffStartDate, setTimeOffStartDate] = useState(null);
  const [timeOffEndDate, setTimeOffEndDate] = useState(null);
  const [timeOffPurpose, setTimeOffPurpose] = useState('');
  const [rescheduleTimeOffId, setRescheduleTimeOffId] = useState(null);

  useEffect(() => {
    if (user && doctorId) {
      fetchDoctorAppointmentsAndTimeOffs(doctorId);
    }
  }, [user, doctorId]);

  const fetchDoctorAppointmentsAndTimeOffs = async (doctorId) => {
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
        date: new Date(new Date(appointment.date).getTime() + 4 * 60 * 60 * 1000).toISOString(),
        end_date: appointment.end_date ? new Date(new Date(appointment.end_date).getTime() + 4 * 60 * 60 * 1000).toISOString() : null,
      }));
      const appointments = adjustedAppointments.filter(appointment => !appointment.is_time_off);
      const timeOffs = adjustedAppointments.filter(appointment => appointment.is_time_off);
      setAppointments(appointments);
      setTimeOffs(timeOffs);
    } catch (error) {
      console.error('Error fetching doctor appointments and time-offs:', error);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/available_slots?doctor_id=${doctorId}&date=${date}`, {
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

  const handleRequestTimeOff = async () => {
    if (!timeOffStartDate || !timeOffEndDate || !timeOffPurpose) {
      alert('Please provide all the required details for the time off request.');
      return;
    }

    const timeOffData = {
      date: timeOffStartDate.toISOString(),
      end_date: timeOffEndDate.toISOString(),
      purpose: timeOffPurpose,
      doctor: doctorId,
      email: user.email,
      name: user.displayName || user.email
    };

    try {
      const response = await fetch('https://hello-belly-flask-1.onrender.com/api/request_time_off', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timeOffData),
      });

      if (response.ok) {
        alert('Time off requested successfully!');
        setTimeOffStartDate(null);
        setTimeOffEndDate(null);
        setTimeOffPurpose('');
        fetchDoctorAppointmentsAndTimeOffs(doctorId);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error requesting time off:', error);
    }
  };

  const handleRescheduleTimeOff = async (id) => {
    if (!timeOffStartDate || !timeOffEndDate) {
      alert('Please select a new start and end date for rescheduling');
      return;
    }

    const timeOffData = {
      date: timeOffStartDate.toISOString(),
      end_date: timeOffEndDate.toISOString(),
    };

    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timeOffData),
      });

      if (response.ok) {
        alert('Time off rescheduled successfully!');
        setTimeOffStartDate(null);
        setTimeOffEndDate(null);
        setRescheduleTimeOffId(null);
        fetchDoctorAppointmentsAndTimeOffs(doctorId);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error rescheduling time off:', error);
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Appointment canceled successfully!');
        fetchDoctorAppointmentsAndTimeOffs(doctorId);
      } else {
        alert('Error canceling appointment');
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
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
            fetchDoctorAppointmentsAndTimeOffs(doctorId);
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
    if (doctorId) {
      fetchAvailableSlots(doctorId, date.toISOString().split('T')[0]);
    }
  };

  const handleTimeOffDateChange = (date) => {
    setTimeOffStartDate(date);
    if (doctorId) {
      fetchAvailableSlots(doctorId, date.toISOString().split('T')[0]);
    }
  };

  const minTime = new Date();
  minTime.setHours(9, 0, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(17, 0, 0, 0);

  return (
    <div className="doctor-dashboard">
      <h2 className="doctor-dashboard-title">Doctor Dashboard</h2>
  
      <h3 className="doctor-dashboard-section-title">Request Time Off</h3>
      <div className="doctor-dashboard-form-group">
        <label className="doctor-dashboard-label">Start Date and Time:</label>
        <DatePicker
          className="doctor-dashboard-datepicker"
          selected={timeOffStartDate}
          onChange={handleTimeOffDateChange}
          showTimeSelect
          timeIntervals={30}
          timeCaption="Time"
          dateFormat="MMMM d, yyyy h:mm aa"
          minTime={minTime}
          maxTime={maxTime}
          minDate={new Date()}
          includeTimes={availableSlots}
        />
      </div>
      <div className="doctor-dashboard-form-group">
        <label className="doctor-dashboard-label">End Date and Time:</label>
        <DatePicker
          className="doctor-dashboard-datepicker"
          selected={timeOffEndDate}
          onChange={date => setTimeOffEndDate(date)}
          showTimeSelect
          timeIntervals={30}
          timeCaption="Time"
          dateFormat="MMMM d, yyyy h:mm aa"
          minTime={minTime}
          maxTime={maxTime}
          minDate={new Date()}
          includeTimes={availableSlots}
        />
      </div>
      <div className="doctor-dashboard-form-group">
        <label className="doctor-dashboard-label">Purpose:</label>
        <input
          className="doctor-dashboard-input"
          type="text"
          value={timeOffPurpose}
          onChange={(e) => setTimeOffPurpose(e.target.value)}
        />
      </div>
      <button className="doctor-dashboard-button" onClick={handleRequestTimeOff}>Request Time Off</button>
  
      <h3 className="doctor-dashboard-section-title">Upcoming Appointments</h3>
      {appointments.length === 0 ? (
        <p className="doctor-dashboard-no-appointments">No appointments scheduled.</p>
      ) : (
        <ul className="doctor-dashboard-appointments-list">
          {appointments.map((appointment) => (
            <li className="doctor-dashboard-appointment-item" key={appointment.id}>
              <p className="doctor-dashboard-appointment-date">Date and Time: {new Date(new Date(appointment.date).getTime() - 4 * 60 * 60 * 1000).toLocaleString()}</p>
              <p className="doctor-dashboard-appointment-purpose">Purpose: {appointment.purpose}</p>
              <p className="doctor-dashboard-appointment-doctor">Doctor: Dr. {appointment.doctor.name}</p>
              <a className="doctor-dashboard-appointment-link" href={`https://meet.jit.si/${appointment.id}`} target="_blank" rel="noopener noreferrer">Join Meeting</a>
              <button className="doctor-dashboard-button" onClick={() => handleCancel(appointment.id)}>Cancel</button>
              <button className="doctor-dashboard-button" onClick={() => setRescheduleAppointmentId(appointment.id)}>Reschedule</button>
              {rescheduleAppointmentId === appointment.id && (
                <div className="doctor-dashboard-reschedule">
                  <label className="doctor-dashboard-label">Reschedule Date and Time:</label>
                  <DatePicker
                    className="doctor-dashboard-datepicker"
                    selected={selectedDate}
                    onChange={handleDateChange}
                    showTimeSelect
                    timeIntervals={30}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minTime={minTime}
                    maxTime={maxTime}
                    minDate={new Date()}
                    includeTimes={availableSlots}
                  />
                  <button className="doctor-dashboard-button" onClick={() => handleReschedule(appointment.id)}>Confirm Reschedule</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
  
      <h3 className="doctor-dashboard-section-title">Time Off Requests</h3>
      {timeOffs.length === 0 ? (
        <p className="doctor-dashboard-no-timeoffs">No time off requested.</p>
      ) : (
        <ul className="doctor-dashboard-timeoffs-list">
          {timeOffs.map((timeOff) => (
            <li className="doctor-dashboard-timeoff-item" key={timeOff.id}>
              <p className="doctor-dashboard-timeoff-start">Start Time: {new Date(new Date(timeOff.date).getTime() - 4 * 60 * 60 * 1000).toLocaleString()}</p>
              <p className="doctor-dashboard-timeoff-end">End Time: {new Date(new Date(timeOff.end_date).getTime() - 4 * 60 * 60 * 1000).toLocaleString()}</p>
              <p className="doctor-dashboard-timeoff-purpose">Purpose: {timeOff.purpose}</p>
              <button className="doctor-dashboard-button" onClick={() => handleCancel(timeOff.id)}>Cancel</button>
              <button className="doctor-dashboard-button" onClick={() => setRescheduleTimeOffId(timeOff.id)}>Reschedule</button>
              {rescheduleTimeOffId === timeOff.id && (
                <div className="doctor-dashboard-reschedule-timeoff">
                  <label className="doctor-dashboard-label">Reschedule Start Date and Time:</label>
                  <DatePicker
                    className="doctor-dashboard-datepicker"
                    selected={timeOffStartDate}
                    onChange={handleTimeOffDateChange}
                    showTimeSelect
                    timeIntervals={30}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minTime={minTime}
                    maxTime={maxTime}
                    minDate={new Date()}
                    includeTimes={availableSlots}
                  />
                  <label className="doctor-dashboard-label">Reschedule End Date and Time:</label>
                  <DatePicker
                    className="doctor-dashboard-datepicker"
                    selected={timeOffEndDate}
                    onChange={date => setTimeOffEndDate(date)}
                    showTimeSelect
                    timeIntervals={30}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minTime={minTime}
                    maxTime={maxTime}
                    minDate={new Date()}
                    includeTimes={availableSlots}
                  />
                  <button className="doctor-dashboard-button" onClick={() => handleRescheduleTimeOff(timeOff.id)}>Confirm Reschedule</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
  
      <button className="doctor-dashboard-signout-button" onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};
  
  export default DoctorDashboard;