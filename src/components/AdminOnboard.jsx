import React, { useState } from 'react';

const AdminOnboard = () => {
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
        // Handle successful doctor creation (e.g., reset form, update state)
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
    </div>
  );
};
  
  export default AdminOnboard;