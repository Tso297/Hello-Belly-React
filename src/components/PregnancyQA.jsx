import React, { useState, useEffect, useRef } from 'react';
import { useZoom } from './ZoomContext';
import '../CSS/PregnancyQA.css';

const PregnancyQA = () => {
  const { user } = useZoom();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [videos, setVideos] = useState([]);
  const [conversationLog, setConversationLog] = useState([]);
  const chatEndRef = useRef(null);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleAskQuestion = async () => {
    console.log('Asking question:', question);

    // Fetch YouTube videos
    try {
      const videoResponse = await fetch(`https://hello-belly-flask-1.onrender.com/api/youtube?query=${question}`);
      if (videoResponse.ok) {
        const videoData = await videoResponse.json();
        console.log('Fetched Videos:', videoData.videos);
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
        console.log('Fetched answer:', data.answer);
        setConversationLog([...conversationLog, { question, answer: data.answer }]);
      } else {
        const errorData = await response.json();
        console.error('Error fetching answer:', errorData);
      }
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationLog]);

  return (
    <div className="pregnancy-qa">
      <h2 className="pregnancy-qa-title">Automated Chat & Videos</h2>
      <input
        className="pregnancy-qa-input"
        type="text"
        value={question}
        onChange={handleQuestionChange}
        placeholder="Ask a question about pregnancy"
      />
      <button className="pregnancy-qa-ask-button" onClick={handleAskQuestion}>Ask</button>

      <div className="pregnancy-qa-chat-log">
        {conversationLog.map((log, index) => (
          <div key={index} className="pregnancy-qa-chat-entry">
            <p><strong>Q:</strong> {log.question}</p>
            <p><strong>A:</strong> {log.answer}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="pregnancy-qa-videos-section">
        {videos.map((video) => (
          <div className="pregnancy-qa-video" key={video.id}>
            <h4 className="pregnancy-qa-video-title">{video.title}</h4>
            <iframe
              className="pregnancy-qa-video-iframe"
              src={`https://www.youtube.com/embed/${video.id}`}
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