import React, { useState, useEffect } from 'react';

const CreateMeeting = () => {
    const [topic, setTopic] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState(30);
    const [accessToken, setAccessToken] = useState('');

    useEffect(() => {
        // Fetch the access token from your auth logic or local storage
        const token = localStorage.getItem('zoomAccessToken');
        setAccessToken(token);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!accessToken) {
            console.error('Access token is missing');
            return;
        }

        const meetingData = {
            topic,
            start_time: startTime,
            duration,
        };

        try {
            const response = await fetch('http://localhost:5000/api/create_meeting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(meetingData),
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Meeting created successfully:', data);
        } catch (error) {
            console.error('Error creating meeting:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Topic:</label>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
                <label>Start Time:</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
                <label>Duration (minutes):</label>
                <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <button type="submit">Create Meeting</button>
        </form>
    );
};

export default CreateMeeting;