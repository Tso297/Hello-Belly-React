import React, { useState, useEffect } from 'react';
import { useZoom } from './ZoomContext';

const PregnancyQA = () => {
  const { user } = useZoom();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [videos, setVideos] = useState([]);
  const [sidebarVideos, setSidebarVideos] = useState([]);

  useEffect(() => {
    const fetchSidebarVideos = async () => {
      try {
        const response = await fetch('https://hello-belly-flask-1.onrender.com/api/youtube?query=pregnancy tips');
        const data = await response.json();
        console.log('Sidebar Videos:', data.videos);  // Debugging
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
    console.log('Asking question:', question); // Debugging

    // Fetch YouTube videos
    try {
      const videoResponse = await fetch(`https://hello-belly-flask-1.onrender.com/api/youtube?query=${question}`);
      if (videoResponse.ok) {
        const videoData = await videoResponse.json();
        console.log('Fetched Videos:', videoData.videos);  // Debugging
        setVideos(videoData.videos);
      } else {
        console.error('Error fetching videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }

    // Fetch ChatGPT answer
    try {
      const response = await fetch('https://hello-belly-flask-1.onrender.com/api/chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnswer(data.answer);
        console.log('Fetched answer:', data.answer); // Debugging
      } else {
        const errorData = await response.json();
        console.error('Error fetching answer:', errorData);
      }
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  return (
    <div className="pregnancy-qa">
      <h2 className="pregnancy-qa-title">Pregnancy Q&A</h2>
      <input
        className="pregnancy-qa-input"
        type="text"
        value={question}
        onChange={handleQuestionChange}
        placeholder="Ask a question about pregnancy"
      />
      <button className="pregnancy-qa-ask-button" onClick={handleAskQuestion}>Ask</button>
      <div className="pregnancy-qa-answer-section">
        <h3 className="pregnancy-qa-answer-title">Answer</h3>
        <p className="pregnancy-qa-answer">{answer}</p>
      </div>
      <div className="pregnancy-qa-videos-section">
        <h3 className="pregnancy-qa-videos-title">Relevant Videos</h3>
        {videos.map((video) => (
          <div className="pregnancy-qa-video" key={video.id}>
            <h4 className="pregnancy-qa-video-title">{video.title}</h4>
            <iframe
              className="pregnancy-qa-video-iframe"
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
      <div className="pregnancy-qa-sidebar-videos-section">
        <h3 className="pregnancy-qa-sidebar-videos-title">Pregnancy Tips Videos</h3>
        {sidebarVideos.map((video) => (
          <div className="pregnancy-qa-sidebar-video" key={video.id}>
            <h4 className="pregnancy-qa-sidebar-video-title">{video.title}</h4>
            <iframe
              className="pregnancy-qa-sidebar-video-iframe"
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