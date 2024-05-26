import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { Firebase } from "../firebase";
import SendMessage from "./SendMessage";

const db = getFirestore(Firebase);

const Messages = ({ threadId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!threadId) return; // Ensure threadId is defined

    const fetchMessages = async () => {
      try {
        const q = query(
          collection(db, "messages"),
          where("threadId", "==", threadId),
          orderBy("timestamp", "asc") // Order by timestamp ascending
        );
        const querySnapshot = await getDocs(q);
        const fetchedMessages = [];

        for (const docSnap of querySnapshot.docs) {
          const messageData = docSnap.data();
          const senderDoc = await getDoc(
            doc(db, "users", messageData.senderId)
          );
          if (senderDoc.exists()) {
            messageData.senderName =
              senderDoc.data().name || senderDoc.data().email;
          }
          fetchedMessages.push({ id: docSnap.id, ...messageData });
        }

        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [threadId]);

  if (!threadId) {
    return <div>Loading messages...</div>; // Display a loading message while waiting for threadId
  }

  return (
    <div>
      <h2>Messages</h2>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <strong>From:</strong> {message.senderName} <br />
            <strong>Date:</strong>{" "}
            {new Date(message.timestamp.seconds * 1000).toLocaleString()} <br />
            <strong>Message:</strong> {message.message}
          </li>
        ))}
      </ul>
      {/* <SendMessage threadId={threadId} /> */}
    </div>
  );
};

export default Messages;
