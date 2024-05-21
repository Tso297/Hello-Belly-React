import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const CreateMeeting = ({ onMeetingCreated }) => {
  const location = useLocation();
  const accessToken = location.state?.accessToken;
  const [topic, setTopic] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(30);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Create Meeting Form Submitted');
    console.log('Topic:', topic);
    console.log('Start Time:', startTime);
    console.log('Duration:', duration);

    try {
      const response = await fetch('http://localhost:5000/api/create_meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          topic,
          start_time: startTime,
          duration,
        }),
      });

      console.log('Response from create_meeting endpoint:', response);

      if (!response.ok) {
        console.error('Network response was not ok');
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Meeting created successfully:', data);

      onMeetingCreated(data);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Topic:
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </label>
      <label>
        Start Time:
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </label>
      <label>
        Duration (minutes):
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </label>
      <button type="submit">Create Meeting</button>
    </form>
  );
};

export default CreateMeeting;