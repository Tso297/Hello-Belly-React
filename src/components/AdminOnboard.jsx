import React, { useState } from 'react';

const AdminOnboard = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const doctorData = { name, email };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/doctors?admin_email=torcsh30@gmail.com', {
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
    <div>
      <h2>Onboard a New Doctor</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Doctor</button>
      </form>
    </div>
  );
};

export default AdminOnboard;