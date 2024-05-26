import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";
import { Firebase } from "../firebase";
import { useAuth } from "./AuthContext";
import Messages from "./Messages";
import SendMessage from "./SendMessage";

const db = getFirestore(Firebase);

const MessageDetail = () => {
  const { user } = useAuth();
  const { messageId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [senderName, setSenderName] = useState("");
  const [viewThread, setViewThread] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      const messageDoc = await getDoc(doc(db, "messages", messageId));
      if (messageDoc.exists()) {
        const messageData = messageDoc.data();
        setMessage({ id: messageId, ...messageData });

        const senderDoc = await getDoc(doc(db, "users", messageData.senderId));
        if (senderDoc.exists()) {
          setSenderName(senderDoc.data().name || senderDoc.data().email);
        }
      }
    };

    fetchMessage();
  }, [messageId]);

  const handleDelete = async () => {
    const messageRef = doc(db, "messages", messageId);
    await deleteDoc(messageRef);
    navigate(-1); // Go back to the previous page
  };

  const handleReply = () => {
    setViewThread(true); // Show the entire thread and reply form
  };

  const handleViewThread = () => {
    setViewThread(true); // Show the entire thread
  };

  if (!message) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Message Detail</h2>
      {viewThread ? (
        <div>
          <Messages threadId={message.threadId} />
          <SendMessage
            receiverId={message.senderId}
            threadId={message.threadId}
            parentMessageId={message.id}
            originalSubject={message.subject}
          />
        </div>
      ) : (
        <>
          <strong>From:</strong> {senderName} <br />
          <strong>Date:</strong>{" "}
          {new Date(message.timestamp.seconds * 1000).toLocaleString()} <br />
          <strong>Subject:</strong> {message.subject} <br />
          <strong>Message:</strong> {message.message} <br />
          <button onClick={handleReply}>Reply</button>
          <button onClick={handleDelete}>Delete</button>
          <button onClick={handleViewThread}>View Thread</button>
        </>
      )}
    </div>
  );
};

export default MessageDetail;
