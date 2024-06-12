import React, { useState, useEffect, useRef } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  deleteDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { Firebase } from "../firebase";
import { useAuth } from "./AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import SearchUsers from "./SearchUsers";
import "../CSS/chatPage.css";

const db = getFirestore(Firebase);

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { threadId } = useParams();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [subject, setSubject] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/"); // Navigate to home page on logout
      return;
    }

    fetchChats();
  }, [user, navigate]);

  const fetchChats = async () => {
    if (!user) return;

    const receivedQuery = query(
      collection(db, "messages"),
      where("receiverId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const sentQuery = query(
      collection(db, "messages"),
      where("senderId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const receivedSnapshot = await getDocs(receivedQuery);
    const sentSnapshot = await getDocs(sentQuery);

    const chatMap = new Map();

    const processMessage = async (messageData) => {
      if (!chatMap.has(messageData.threadId)) {
        const otherUserId =
          messageData.senderId === user.uid
            ? messageData.receiverId
            : messageData.senderId;
        const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
        if (otherUserDoc.exists()) {
          messageData.otherUserName =
            otherUserDoc.data().name || otherUserDoc.data().email;
        }
        chatMap.set(messageData.threadId, {
          id: messageData.threadId,
          otherUserName: messageData.otherUserName,
          receiverId: messageData.receiverId,
          timestamp: messageData.timestamp,
          subject: messageData.subject,
          lastMessage: messageData.message,
        });
      } else {
        const existingChat = chatMap.get(messageData.threadId);
        if (existingChat.timestamp < messageData.timestamp) {
          existingChat.timestamp = messageData.timestamp;
          existingChat.lastMessage = messageData.message;
        }
      }
    };

    for (const docSnap of receivedSnapshot.docs.concat(sentSnapshot.docs)) {
      const messageData = docSnap.data();
      await processMessage(messageData);
    }

    const sortedChats = Array.from(chatMap.values()).sort(
      (a, b) => b.timestamp.seconds - a.timestamp.seconds
    );

    setChats(sortedChats);
  };

  useEffect(() => {
    if (threadId && user) {
      const chat = chats.find((chat) => chat.id === threadId);
      if (chat) {
        setSelectedChat(chat);
        setSubject(chat.subject); // Set the subject for the selected chat
        fetchMessages(chat.id);
      }
    } else {
      setSelectedChat(null);
      setMessages([]);
      setSubject(""); // Clear the subject when no chat is selected
    }
  }, [threadId, chats, user]);

  const fetchMessages = async (threadId) => {
    if (!user) return;

    const q = query(
      collection(db, "messages"),
      where("threadId", "==", threadId),
      orderBy("timestamp", "asc") // Order by timestamp ascending
    );
    const querySnapshot = await getDocs(q);
    const fetchedMessages = [];

    for (const docSnap of querySnapshot.docs) {
      const messageData = docSnap.data();
      const senderDoc = await getDoc(doc(db, "users", messageData.senderId));
      if (senderDoc.exists()) {
        messageData.senderName =
          senderDoc.data().name || senderDoc.data().email;
      }
      fetchedMessages.push({ id: docSnap.id, ...messageData });
    }

    setMessages(fetchedMessages);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectChat = (chat) => {
    navigate(`/chat/${chat.id}`);
  };

  const handleDeleteChat = async (threadId) => {
    const q = query(
      collection(db, "messages"),
      where("threadId", "==", threadId)
    );
    const querySnapshot = await getDocs(q);

    // Delete all messages in the chat
    for (const docSnap of querySnapshot.docs) {
      await deleteDoc(doc(db, "messages", docSnap.id));
    }

    // Update local state after deletion
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== threadId));
    navigate("/chat");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (user && newMessage && selectedChat) {
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        receiverId: selectedChat.receiverId, // Ensure receiverId is set
        message: newMessage,
        subject: selectedChat.subject || subject, // Use the existing subject or new subject
        threadId: selectedChat.id,
        timestamp: Timestamp.now(),
      });
      setNewMessage("");
      fetchMessages(selectedChat.id);
      if (!selectedChat.subject) {
        setSelectedChat((prevChat) => ({ ...prevChat, subject }));
      }
      fetchChats(); // Fetch chats after sending a message to update the inbox order
    }
  };

  const handleSelectUser = (selectedUser) => {
    const threadId = doc(collection(db, "threads")).id;
    const newChat = {
      id: threadId,
      receiverName: selectedUser.name || selectedUser.email,
      receiverId: selectedUser.id,
    };
    setSelectedChat(newChat);
    setSubject(""); // Clear the subject when starting a new chat
    navigate(`/chat/${threadId}`);
  };

  const handleBackToInbox = () => {
    setSelectedChat(null);
    setMessages([]);
    setSubject("");
    fetchChats(); // Fetch chats when navigating back to inbox
    navigate("/chat");
  };

  const handleReturnToDash = () => {
    navigate("/Dashboard");
  };

  if (!user) return null; // Prevent rendering if user is null

  return (
    <>
      <div className="topContainer">
        <h2 className="title">Messages</h2>
        <button className="returnToDashButton" onClick={handleReturnToDash}>
          Return to Dashboard
        </button>
      </div>

      <div className="chatContainer">
        <div className="chats">
          <div className="newChat">
            <SearchUsers onSelectUser={handleSelectUser} />
          </div>
          <ul>
            {chats.map((chat) => {
              const chatDate = new Date(chat.timestamp.seconds * 1000);
              const isToday =
                chatDate.toDateString() === new Date().toDateString();

              return (
                <li key={chat.id} onClick={() => handleSelectChat(chat)}>
                  <div className="chatHeader">
                    <div className="chatSender">{chat.otherUserName}</div>
                    <span className="chatTime">
                      {isToday
                        ? chatDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : chatDate.toLocaleDateString()}
                    </span>
                  </div>
                  <span className="chatSubject">{chat.subject}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="chatDetail">
          {selectedChat ? (
            <div className="selectedChat">
              <h3>Chat with {selectedChat.otherUserName}</h3>
              <h4 className="chatSubject">{selectedChat.subject}</h4>
              <ul className="chatHistory">
                {messages.map((message) => (
                  <li
                    key={message.id}
                    className={`messageBubble ${
                      user && message.senderId === user.uid
                        ? "sent"
                        : "received"
                    }`}
                  >
                    <div>{message.message}</div>
                    <div className="messageTimestamp">
                      {new Date(
                        message.timestamp.seconds * 1000
                      ).toLocaleString()}
                    </div>
                  </li>
                ))}
                <div ref={messagesEndRef} />
              </ul>
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
                <button type="submit">Send Message</button>
              </form>
              <button className="backButton" onClick={handleBackToInbox}>
                Close Chat
              </button>
              <button
                className="deleteButton"
                onClick={() => handleDeleteChat(selectedChat.id)}
              >
                Delete Conversation
              </button>
            </div>
          ) : (
            <div className="placeholder">
              <h3>Select a chat to start messaging</h3>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
