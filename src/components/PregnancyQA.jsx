import React, { useState, useEffect } from 'react';

const PregnancyQA = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [videos, setVideos] = useState([]);
  const [sidebarVideos, setSidebarVideos] = useState([]);

  useEffect(() => {
    const fetchSidebarVideos = async () => {
      console.log('Fetching sidebar videos for pregnancy tips');
      try {
        const response = await fetch('https://hello-belly-flask-1.onrender.com/api/youtube?query=pregnancy tips');
        const data = await response.json();
        console.log('Sidebar videos fetched successfully:', data);
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
    console.log('Asking question:', question);
    try {
      const response = await fetch('https://hello-belly-flask-1.onrender.com/api/chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      console.log('Received answer:', data);
      setAnswer(data.answer);

      console.log('Fetching relevant YouTube videos for question:', question);
      const videoResponse = await fetch(`https://hello-belly-flask-1.onrender.com/api/youtube?query=${question}`);
      const videoData = await videoResponse.json();
      console.log('Relevant videos fetched successfully:', videoData);
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