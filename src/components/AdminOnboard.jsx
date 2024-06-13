import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc } from "firebase/firestore"; // Import Firestore functions
import { Firebase } from "../firebase"; // Import Firebase configuration

const db = getFirestore(Firebase); // Initialize Firestore

const AdminOnboard = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [doctors, setDoctors] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const doctorData = { name, email };
    console.log('Submitting doctor data:', doctorData); // Log the data being submitted

    try {
      // Save to ElephantSQL
      const response = await fetch('https://hello-belly-flask-1.onrender.com/api/admin/doctors?admin_email=torcsh30@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });

      console.log('Response status:', response.status); // Log the response status

      if (response.ok) {
        const data = await response.json();
        console.log('Doctor created successfully in ElephantSQL:', data);

        // Save to Firebase
        try {
          const docRef = await addDoc(collection(db, "doctors"), {
            name: doctorData.name,
            email: doctorData.email,
            id: data.id // Ensure the response contains the doctor's id from ElephantSQL
          });
          console.log('Doctor created successfully in Firebase with ID:', docRef.id);
          alert('Doctor created successfully in Firebase');
        } catch (firebaseError) {
          console.error('Error creating doctor in Firebase:', firebaseError);
          alert('Error creating doctor in Firebase. Please check the console for details.');
        }

        // Update state to include the new doctor
        setDoctors([...doctors, { ...doctorData, id: data.id }]);

        // Reset form state
        setName('');
        setEmail('');
      } else {
        const errorData = await response.json();
        console.error('Error response from ElephantSQL:', errorData); // Log the error response
        alert(`Error creating doctor: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating doctor:', error);
      alert('Error creating doctor. Please check the console for details.');
    }
  };

  return (
    <div className="admin-onboard">
      <h2 className="admin-onboard-title">Onboard a New Doctor</h2>
      <form className="admin-onboard-form" onSubmit={handleSubmit}>
        <div className="admin-onboard-form-group">
          <label className="admin-onboard-label">Name:</label>
          <input
            className="admin-onboard-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="admin-onboard-form-group">
          <label className="admin-onboard-label">Email:</label>
          <input
            className="admin-onboard-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button className="admin-onboard-submit-button" type="submit">Create Doctor</button>
      </form>
      <h2 className="existing-doctors-title">Existing Employees</h2>
      <ul className="existing-doctors-list">
        {doctors.map((doctor) => (
          <li key={doctor.id} className="existing-doctor-item">
            <p>Email: {doctor.email}</p>
            <h3>{doctor.name}</h3>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminOnboard;