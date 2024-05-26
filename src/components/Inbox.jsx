import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { Firebase } from "../firebase";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const db = getFirestore(Firebase);

const Inbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!user) return; // Wait until the user is authenticated

    const fetchMessages = async () => {
      const q = query(
        collection(db, "messages"),
        where("receiverId", "==", user.uid),
        orderBy("timestamp", "desc") // Order by timestamp descending
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
    };

    fetchMessages();
  }, [user]);

  const handleDelete = async (messageId) => {
    const messageRef = doc(db, "messages", messageId);
    await deleteDoc(messageRef);
    // Update local state after deletion
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== messageId)
    );
  };

  const handleViewMessage = (messageId) => {
    navigate(`/message/${messageId}`);
  };

  if (!user) {
    return <div>Loading...</div>; // Show a loading message or spinner while the user is being authenticated
  }

  return (
    <div>
      <h2>Inbox</h2>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <strong>From:</strong> {message.senderName} <br />
            <strong>Date:</strong>{" "}
            {new Date(message.timestamp.seconds * 1000).toLocaleString()} <br />
            <strong>Subject:</strong> {message.subject} <br />
            <button onClick={() => handleViewMessage(message.id)}>
              View Message
            </button>
            <button onClick={() => handleDelete(message.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inbox;
