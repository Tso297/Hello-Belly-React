import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useZoom } from './ZoomContext';

const PregnancyQA = () => {
  const { user, handleSignOut, doctorId } = useZoom();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [videos, setVideos] = useState([]);
  const [sidebarVideos, setSidebarVideos] = useState([]);

  useEffect(() => {
    // Fetch general pregnancy-related videos for the sidebar
    const fetchSidebarVideos = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/youtube?query=pregnancy tips', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setSidebarVideos(data.videos);
      } catch (error) {
        console.error('Error fetching sidebar videos:', error);
      }
    };

    fetchSidebarVideos();
  }, []);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleAskQuestion = async () => {
    try {
      // Call ChatGPT API
      const response = await fetch('http://127.0.0.1:5000/api/chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      setAnswer(data.answer);

      // Call YouTube API
      const videoResponse = await fetch(`http://127.0.0.1:5000/api/youtube?query=${question}`);
      const videoData = await videoResponse.json();
      setVideos(videoData.videos);
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  return (
    <div>
      <h2>Pregnancy Q&A</h2>
      <input
        type="text"
        value={question}
        onChange={handleQuestionChange}
        placeholder="Ask a question about pregnancy"
      />
      <button onClick={handleAskQuestion}>Ask</button>
      <div>
        <h3>Answer</h3>
        <p>{answer}</p>
      </div>
      <div>
        <h3>Relevant Videos</h3>
        {videos.map((video) => (
          <div key={video.id}>
            <h4>{video.title}</h4>
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${video.id}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            ></iframe>
          </div>
        ))}
      </div>
      <div>
        <h3>Pregnancy Tips Videos</h3>
        {sidebarVideos.map((video) => (
          <div key={video.id}>
            <h4>{video.title}</h4>
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${video.id}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            ></iframe>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PregnancyQA;