import React from 'react';

const MeetingDetails = ({ meeting }) => {
  if (!meeting) {
    return null;
  }

  return (
    <div>
      <h2>Meeting Created</h2>
      <p>Meeting ID: {meeting.id}</p>
      <p>Topic: {meeting.topic}</p>
      <p>Start Time: {meeting.start_time}</p>
      <p>Duration: {meeting.duration} minutes</p>
      <p>Join URL: <a href={meeting.join_url} target="_blank" rel="noopener noreferrer">{meeting.join_url}</a></p>
    </div>
  );
};

export default MeetingDetails;