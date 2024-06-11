import React, { useState, useEffect } from 'react';
import AddClassForm from './AddClassForm';
import '../CSS/Admin.css';

const Admin = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctorToUpdate, setDoctorToUpdate] = useState({ id: '', name: '', email: '' });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('https://hello-belly-flask-1.onrender.com/api/doctors', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setDoctors(data.doctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  const handleUpdateDoctor = async () => {
    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/doctors/${doctorToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorToUpdate),
      });

      if (response.ok) {
        alert('Doctor updated successfully!');
        setDoctors(doctors.map(doc => doc.id === doctorToUpdate.id ? doctorToUpdate : doc));
        setDoctorToUpdate({ id: '', name: '', email: '' });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
    }
  };

  const handleDeleteDoctor = async (id) => {
    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/doctors/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Doctor deleted successfully!');
        setDoctors(doctors.filter(doc => doc.id !== id));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div className="admin-sections">
        <div className="admin-section add-class">
          <AddClassForm />
        </div>
        <div className="admin-section onboard-doctor">
          <AdminOnboard
            doctors={doctors}
            setDoctors={setDoctors}
            doctorToUpdate={doctorToUpdate}
            setDoctorToUpdate={setDoctorToUpdate}
            handleUpdateDoctor={handleUpdateDoctor}
            handleDeleteDoctor={handleDeleteDoctor}
          />
        </div>
      </div>
    </div>
  );
};

const AdminOnboard = ({ doctors, setDoctors, doctorToUpdate, setDoctorToUpdate, handleUpdateDoctor, handleDeleteDoctor }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const doctorData = { name, email };

    try {
      const response = await fetch('https://hello-belly-flask-1.onrender.com/api/admin/doctors?admin_email=torcsh30@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Doctor created successfully');
        setDoctors((prevDoctors) => [...prevDoctors, data]);
        setName('');
        setEmail('');
      } else {
        const errorData = await response.json();
        alert(`Error creating doctor: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating doctor:', error);
      alert('Error creating doctor. Please check the console for details.');
    }
  };

  return (
    <div>
      <h2 className="admin-onboard-title">Onboard a New Employee</h2>
      <form className="admin-onboard-form" onSubmit={handleSubmit}>
        <input
          className="admin-onboard-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        <input
          className="admin-onboard-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <button className="admin-onboard-submit-button" type="submit">Onboard Employee</button>
      </form>
      <h2 className="existing-doctors-title">Existing Employees</h2>
      <ul className="existing-doctors-list">
        {doctors.map((doctor) => (
          <li className="existing-doctor-item" key={doctor.id}>
            <h3 className="existing-doctor-name">{doctor.name}</h3>
            <p className="existing-doctor-email">Email: {doctor.email}</p>
            <button onClick={() => setDoctorToUpdate({ id: doctor.id, name: doctor.name, email: doctor.email })}>Update</button>
            <button onClick={() => handleDeleteDoctor(doctor.id)}>Delete</button>
          </li>
        ))}
      </ul>
      {doctorToUpdate.id && (
        <div className="update-doctor-form">
          <h2>Update Doctor</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateDoctor();
          }}>
            <input
              type="text"
              value={doctorToUpdate.name}
              onChange={(e) => setDoctorToUpdate({ ...doctorToUpdate, name: e.target.value })}
              placeholder="Name"
              required
            />
            <input
              type="email"
              value={doctorToUpdate.email}
              onChange={(e) => setDoctorToUpdate({ ...doctorToUpdate, email: e.target.value })}
              placeholder="Email"
              required
            />
            <button type="submit">Update</button>
            <button onClick={() => setDoctorToUpdate({ id: '', name: '', email: '' })}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;