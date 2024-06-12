import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useZoom } from "./ZoomContext";
import "../CSS/MeetingScheduler.css";

const MeetingScheduler = () => {
  const { user, handleSignOut, appointments, setAppointments } = useZoom();
  const [selectedDate, setSelectedDate] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [doctor, setDoctor] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAppointments(user.email);
      fetchDoctors();
    }
  }, [user]);

  const fetchAppointments = async (email) => {
    try {
      const response = await fetch(
        `https://hello-belly-flask-1.onrender.com/api/appointments?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setAppointments(data.appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        "https://hello-belly-flask-1.onrender.com/api/doctors",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setDoctors(data.doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const response = await fetch(
        `https://hello-belly-flask-1.onrender.com/api/available_slots?doctor_id=${doctorId}&date=${date}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      const availableDates = data.available_slots.map((slot) => new Date(slot));
      setAvailableSlots(availableDates);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const meetingData = {
      date: selectedDate.toISOString(),
      purpose,
      doctor,
      email: user.email,
      name: user.displayName || user.email,
    };

    const url = editingAppointment
      ? `https://hello-belly-flask-1.onrender.com/api/appointments/${editingAppointment.id}`
      : `https://hello-belly-flask-1.onrender.com/api/schedule_meeting`;
    const method = editingAppointment ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meetingData),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          `Meeting ${
            editingAppointment ? "updated" : "scheduled"
          } successfully with ${data.appointment.doctor.name}!`
        );
        alert(
          `Meeting ${
            editingAppointment ? "updated" : "scheduled"
          } successfully with Dr. ${data.appointment.doctor.name}!`
        );
        setEditingAppointment(null);
        setSelectedDate(null);
        setPurpose("");
        setDoctor("");
        fetchAppointments(user.email);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error scheduling/updating meeting:", error);
    }
  };

  const handleDoctorChange = (e) => {
    const selectedDoctor = e.target.value;
    setDoctor(selectedDoctor);
    if (selectedDoctor) {
      fetchAvailableSlots(
        selectedDoctor,
        selectedDate
          ? selectedDate.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (doctor) {
      fetchAvailableSlots(doctor, date.toISOString().split("T")[0]);
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await fetch(
        `https://hello-belly-flask-1.onrender.com/api/appointments/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Meeting canceled successfully!");
        fetchAppointments(user.email);
      } else {
        alert("Error canceling meeting");
      }
    } catch (error) {
      console.error("Error canceling meeting:", error);
    }
  };

  const handleReschedule = async (id) => {
    if (!selectedDate) {
      alert("Please select a new date and time for rescheduling");
      return;
    }

    const meetingData = {
      date: selectedDate.toISOString(),
    };

    console.log("Rescheduling meeting with data:", meetingData);

    try {
      const response = await fetch(
        `https://hello-belly-flask-1.onrender.com/api/appointments/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(meetingData),
        }
      );

      if (response.ok) {
        alert("Meeting rescheduled successfully!");
        setSelectedDate(null);
        setRescheduleAppointmentId(null);
        fetchAppointments(user.email);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error rescheduling meeting:", error);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setSelectedDate(new Date(appointment.date));
    setPurpose(appointment.purpose);
    setDoctor(appointment.doctor.id);
  };

  const minTime = new Date();
  minTime.setHours(9, 0, 0, 0);
  minTime.setMinutes(0);
  const maxTime = new Date();
  maxTime.setHours(17, 0, 0, 0);

  return (
    <div className="meeting-scheduler">
      <h2 className="meeting-scheduler-title">Meeting Scheduler</h2>
      <form className="meeting-scheduler-form" onSubmit={handleSubmit}>
        <div className="meeting-scheduler-form-group">
          <label className="meeting-scheduler-label">Purpose:</label>
          <input
            className="meeting-scheduler-input"
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
        </div>
        <div className="meeting-scheduler-form-group">
          <label className="meeting-scheduler-label">Consultant:</label>
          <select
            className="meeting-scheduler-select"
            value={doctor}
            onChange={handleDoctorChange}
            required
          >
            <option value="">Select a consultant</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>
        <div className="meeting-scheduler-form-group">
          {doctor && (
            <>
              <label className="meeting-scheduler-label">Date and Time:</label>
              <DatePicker
                className="meeting-scheduler-datepicker"
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
            </>
          )}
        </div>
        <button className="meetingSchedulerButton" type="submit">
          {editingAppointment ? "Update Meeting" : "Schedule Meeting"}
        </button>
      </form>
      <div className="upcoming-appointments-container">
        <h3 className="meeting-scheduler-upcoming-title">
          Upcoming Appointments
        </h3>

        {appointments.length === 0 ? (
          <p className="meeting-scheduler-no-appointments">
            No appointments scheduled.
          </p>
        ) : (
          <ul className="meeting-scheduler-appointments-list">
            {appointments.map((appointment) => (
              <li
                className="meeting-scheduler-appointment-item"
                key={appointment.id}
              >
                <p className="meeting-scheduler-appointment-date">
                  Date and Time: {new Date(appointment.date).toLocaleString()}
                </p>
                <p className="meeting-scheduler-appointment-purpose">
                  Purpose: {appointment.purpose}
                </p>
                <p className="meeting-scheduler-appointment-doctor">
                  Doctor: Dr. {appointment.doctor.name}
                </p>
                <p className="meeting-scheduler-appointment-link">
                  Join Link:{" "}
                  <a
                    href={`https://meet.jit.si/${appointment.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Meeting
                  </a>
                </p>
                <div className="button-container">
                  <button
                    className="meeting-scheduler-button, cancel"
                    onClick={() => handleCancel(appointment.id)}
                  >
                    Cancel
                  </button>
                  <button
                    className="meeting-scheduler-button, reschedule"
                    onClick={() => setRescheduleAppointmentId(appointment.id)}
                  >
                    Reschedule
                  </button>
                </div>

                {rescheduleAppointmentId === appointment.id && (
                  <div className="meeting-scheduler-reschedule">
                    <label className="meeting-scheduler-label">
                      Reschedule Date and Time:
                    </label>
                    <DatePicker
                      className="meeting-scheduler-datepicker"
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
                    <button
                      className="meeting-scheduler-button"
                      onClick={() => handleReschedule(appointment.id)}
                    >
                      Confirm Reschedule
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MeetingScheduler;
