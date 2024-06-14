import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useZoom } from "./ZoomContext";
import "../CSS/DoctorDashboard.css";
import Test from './Test'; // Import the Test component

const DoctorDashboard = () => {
  const { user, doctorId } = useZoom();
  const [appointments, setAppointments] = useState([]);
  const [timeOffs, setTimeOffs] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);
  const [timeOffStartDate, setTimeOffStartDate] = useState(null);
  const [timeOffEndDate, setTimeOffEndDate] = useState(null);
  const [timeOffPurpose, setTimeOffPurpose] = useState("");
  const [rescheduleTimeOffId, setRescheduleTimeOffId] = useState(null);
  const [renameFileId, setRenameFileId] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);

  useEffect(() => {
    if (user && doctorId) {
      fetchDoctorAppointmentsAndTimeOffs(doctorId);
      fetchDoctorFiles(doctorId);
    }
  }, [user, doctorId]);

  const fetchDoctorAppointmentsAndTimeOffs = async (doctorId) => {
    try {
      const response = await fetch(
        `https://hello-belly-flask-1.onrender.com/api/doctor_appointments?doctor_id=${doctorId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      const adjustedAppointments = data.appointments.map((appointment) => ({
        ...appointment,
        date: new Date(
          new Date(appointment.date).getTime() + 4 * 60 * 60 * 1000
        ).toISOString(),
        end_date: appointment.end_date
          ? new Date(
              new Date(appointment.end_date).getTime() + 4 * 60 * 60 * 1000
            ).toISOString()
          : null,
      }));
      const appointments = adjustedAppointments.filter(
        (appointment) => !appointment.is_time_off
      );
      const timeOffs = adjustedAppointments.filter(
        (appointment) => appointment.is_time_off
      );
      setAppointments(appointments);
      setTimeOffs(timeOffs);
    } catch (error) {
      console.error("Error fetching doctor appointments and time-offs:", error);
    }
  };

  const fetchDoctorFiles = async (doctorId) => {
    try {
      const response = await fetch(
        `https://hello-belly-flask-1.onrender.com/api/files?doctor_id=${doctorId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error("Error fetching doctor files:", error);
    }
  };

  const handleFileUpload = (filePath) => {
    alert(`File uploaded successfully! File path: ${filePath}`);
    fetchDoctorFiles(doctorId);  // Refresh the list of files after a new upload
  };

  const handleRenameFile = async (fileId) => {
    try {
      const response = await fetch('https://hello-belly-flask-1.onrender.com/api/rename_file', {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_id: fileId, new_file_name: newFileName })
      });

      if (response.ok) {
        alert('File renamed successfully');
        setRenameFileId(null);
        setNewFileName('');
        fetchDoctorFiles(doctorId);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error renaming file:', error);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await fetch('https://hello-belly-flask-1.onrender.com/api/delete_file', {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_id: fileId })
      });

      if (response.ok) {
        alert('File deleted successfully');
        fetchDoctorFiles(doctorId);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleRequestTimeOff = async () => {
    if (!timeOffStartDate || !timeOffEndDate || !timeOffPurpose) {
      alert(
        "Please provide all the required details for the time off request."
      );
      return;
    }

    const timeOffData = {
      date: timeOffStartDate.toISOString(),
      end_date: timeOffEndDate.toISOString(),
      purpose: timeOffPurpose,
      doctor: doctorId,
      email: user.email,
      name: user.displayName || user.email,
    };

    try {
      const response = await fetch(
        "https://hello-belly-flask-1.onrender.com/api/request_time_off",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(timeOffData),
        }
      );

      if (response.ok) {
        alert("Time off requested successfully!");
        setTimeOffStartDate(null);
        setTimeOffEndDate(null);
        setTimeOffPurpose("");
        fetchDoctorAppointmentsAndTimeOffs(doctorId);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error requesting time off:", error);
    }
  };

  const handleRescheduleTimeOff = async (id) => {
    if (!timeOffStartDate || !timeOffEndDate) {
      alert("Please select a new start and end date for rescheduling");
      return;
    }

    const timeOffData = {
      date: timeOffStartDate.toISOString(),
      end_date: timeOffEndDate.toISOString(),
    };

    try {
      const response = await fetch(
        `https://hello-belly-flask-1.onrender.com/api/appointments/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(timeOffData),
        }
      );

      if (response.ok) {
        alert("Time off rescheduled successfully!");
        setTimeOffStartDate(null);
        setTimeOffEndDate(null);
        setRescheduleTimeOffId(null);
        fetchDoctorAppointmentsAndTimeOffs(doctorId);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error rescheduling time off:", error);
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
        alert("Appointment canceled successfully!");
        fetchDoctorAppointmentsAndTimeOffs(doctorId);
      } else {
        alert("Error canceling appointment");
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
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
        fetchDoctorAppointmentsAndTimeOffs(doctorId);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error rescheduling meeting:", error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (doctorId) {
      fetchAvailableSlots(doctorId, date.toISOString().split("T")[0]);
    }
  };

  const handleTimeOffDateChange = (date) => {
    setTimeOffStartDate(date);
    if (doctorId) {
      fetchAvailableSlots(doctorId, date.toISOString().split("T")[0]);
    }
  };

  const minTime = new Date();
  minTime.setHours(9, 0, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(17, 0, 0, 0);

  return (
    <div className="doctor-dashboard">
      <h2 className="doctor-dashboard-title">Doctor Dashboard</h2>
      
      <div className="doctor-dashboard-columns">
        <div className="doctor-dashboard-column">
          <h3 className="doctor-dashboard-section-title-upload">Upload Files</h3>
          <Test /> {/* Use the Test component here */}
            <ul className="doctor-dashboard-files-list">
              {files.map((file) => (
                <li key={file.file_path} className="doctor-dashboard-file-item">
                  <a href={`/${file.file_path}`} target="_blank" rel="noopener noreferrer">
                    {file.filename}
                  </a>
                  <div className="doctor-dashboard-file-item-buttons">
        <button onClick={() => handleDeleteFile(file.name)}>Delete</button>
        <button onClick={() => setRenameFileId(file.name)}>Rename</button>
      </div>
                  {renameFileId === file.id && (
                    <div>
                      <input
                        type="text"
                        placeholder="New file name"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                      />
                      <button onClick={() => handleRenameFile(file.id)}>Save</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
        </div>

        <div className="doctor-dashboard-column">
          <h3 className="doctor-dashboard-section-title">Upcoming Appointments</h3>
          {appointments.length === 0 ? (
            <p className="doctor-dashboard-no-appointments">
              No appointments scheduled.
            </p>
          ) : (
            <ul className="doctor-dashboard-appointments-list">
              {appointments.map((appointment) => (
                <li
                  className="doctor-dashboard-appointment-item"
                  key={appointment.id}
                >
                  <p className="doctor-dashboard-appointment-date">
                    Date and Time:{" "}
                    {new Date(
                      new Date(appointment.date).getTime() - 4 * 60 * 60 * 1000
                    ).toLocaleString()}
                  </p>
                  <p className="doctor-dashboard-appointment-purpose">
                    Purpose: {appointment.purpose}
                  </p>
                  <p className="doctor-dashboard-appointment-doctor">
                    Patient: {appointment.user.name}
                  </p>
                  <a
                    className="doctor-dashboard-appointment-link"
                    href={`https://meet.jit.si/${appointment.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Meeting
                  </a>
                  <button
                    className="doctor-dashboard-button"
                    onClick={() => handleCancel(appointment.id)}
                  >
                    Cancel
                  </button>
                  <button
                    className="doctor-dashboard-button"
                    onClick={() => setRescheduleAppointmentId(appointment.id)}
                  >
                    Reschedule
                  </button>
                  {rescheduleAppointmentId === appointment.id && (
                    <div className="doctor-dashboard-reschedule">
                      <label className="doctor-dashboard-label">
                        Reschedule Date and Time:
                      </label>
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
                      <button
                        className="doctor-dashboard-button"
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

        <div className="doctor-dashboard-column">
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
              onChange={(date) => setTimeOffEndDate(date)}
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
          <button
            className="doctor-dashboard-button"
            onClick={handleRequestTimeOff}
          >
            Request Time Off
          </button>
          
          <h3 className="doctor-dashboard-section-title">Requested Time Off</h3>
          {timeOffs.length === 0 ? (
            <p className="doctor-dashboard-no-timeoffs">No time off requested.</p>
          ) : (
            <ul className="doctor-dashboard-timeoffs-list">
              {timeOffs.map((timeOff) => (
                <li className="doctor-dashboard-timeoff-item" key={timeOff.id}>
                  <p className="doctor-dashboard-timeoff-start">
                    Start Time:{" "}
                    {new Date(
                      new Date(timeOff.date).getTime() - 4 * 60 * 60 * 1000
                    ).toLocaleString()}
                  </p>
                  <p className="doctor-dashboard-timeoff-end">
                    End Time:{" "}
                    {new Date(
                      new Date(timeOff.end_date).getTime() - 4 * 60 * 60 * 1000
                    ).toLocaleString()}
                  </p>
                  <p className="doctor-dashboard-timeoff-purpose">
                    Purpose: {timeOff.purpose}
                  </p>
                  <button
                    className="doctor-dashboard-button"
                    onClick={() => handleCancel(timeOff.id)}
                  >
                    Cancel
                  </button>
                  <button
                    className="doctor-dashboard-button"
                    onClick={() => setRescheduleTimeOffId(timeOff.id)}
                  >
                    Reschedule
                  </button>
                  {rescheduleTimeOffId === timeOff.id && (
                    <div className="doctor-dashboard-reschedule-timeoff">
                      <label className="doctor-dashboard-label">
                        Reschedule Start Date and Time:
                      </label>
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
                      <label className="doctor-dashboard-label">
                        Reschedule End Date and Time:
                      </label>
                      <DatePicker
                        className="doctor-dashboard-datepicker"
                        selected={timeOffEndDate}
                        onChange={(date) => setTimeOffEndDate(date)}
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
                        className="doctor-dashboard-button"
                        onClick={() => handleRescheduleTimeOff(timeOff.id)}
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
    </div>
  );
};

export default DoctorDashboard;