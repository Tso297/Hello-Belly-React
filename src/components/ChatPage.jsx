import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import SearchUsers from "./SearchUsers";
import FileUploader from "./FileUploader";
import '../CSS/Dashboard.css'; // Ensure this is correct

const ChatPage = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [subject, setSubject] = useState("");
  const messagesEndRef = useRef(null);

  const handleFileUpload = async (filePath, fileName) => {
    await addMessage(newMessage, filePath, fileName);
  };

  const addMessage = async (message, fileUrl = "", fileName = "") => {
    try {
      const response = await fetch('https://hello-belly-flask-1.onrender.com/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: user.uid,
          receiverId: selectedChat.receiverId,
          message,
          subject: selectedChat.subject || subject,
          threadId: selectedChat.id,
          fileUrl,
          fileName,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages(selectedChat.id);
        if (!selectedChat.subject) {
          setSelectedChat((prevChat) => ({ ...prevChat, subject }));
        }
        fetchChats();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  const fetchChats = async () => {
    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/chats?userId=${user.uid}`);
      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchMessages = async (threadId) => {
    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/messages?threadId=${threadId}`);
      const data = await response.json();
      setMessages(data.messages);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setSubject(chat.subject);
    fetchMessages(chat.id);
  };

  const handleDeleteChat = async (threadId) => {
    try {
      const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/messages/${threadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChats((prevChats) => prevChats.filter((chat) => chat.id !== threadId));
        setSelectedChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (user && newMessage && selectedChat) {
      await addMessage(newMessage);
    }
  };

  const handleSelectUser = (selectedUser) => {
    const newChat = {
      id: `new-${Date.now()}`,
      receiverId: selectedUser.id,
      receiverName: selectedUser.name || selectedUser.email,
    };
    setSelectedChat(newChat);
    setSubject("");
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Invalid Date";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!user) return null;

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <SearchUsers onSelectUser={handleSelectUser} />
        <ul>
          {chats.map((chat) => {
            const chatDate = new Date(chat.timestamp);
            const isToday = chatDate.toDateString() === new Date().toDateString();

            return (
              <li key={chat.id} onClick={() => handleSelectChat(chat)}>
                <div className="chatHeader">
                  <div className="chatSender">{chat.otherUserName}</div>
                  <span className="chatTime">
                    {isToday
                      ? chatDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : chatDate.toLocaleDateString()}
                  </span>
                </div>
                <span className="chatSubject">{chat.subject}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="chat-log-container">
        <div className="chat-header">
          <h3>{selectedChat ? `Chat with ${selectedChat.otherUserName}` : "Select a chat"}</h3>
        </div>
        <div className="chat-log">
          <ul className="chatHistory">
            {messages.map((message) => (
              <li
                key={message.id}
                className={`messageBubble ${
                  user && message.senderId === user.uid ? "sent" : "received"
                }`}
              >
                <div>{message.message}</div>
                {message.fileUrl && (
                  <div>
                    <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="file-view">
                      {message.fileName || "View File"}
                    </a>
                  </div>
                )}
                <div className="messageTimestamp">
                  {formatTimestamp(message.timestamp)}
                </div>
              </li>
            ))}
            <div ref={messagesEndRef} />
          </ul>
        </div>
      </div>
      {selectedChat && (
        <div className="chat-current">
          <form onSubmit={handleSendMessage}>
            {!selectedChat.subject && (
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                required
              />
            )}
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              required
              className="messageInput"
            ></textarea>
            <button type="submit" className="submit-button">Send Message</button>
            <FileUploader onFileUpload={handleFileUpload} />
          </form>
          <button className="deleteButton" onClick={() => handleDeleteChat(selectedChat.id)}>
            Delete Conversation
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPage;