import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  doc,
} from "firebase/firestore";
import { Firebase } from "../firebase";
import { useAuth } from "./AuthContext";

const db = getFirestore(Firebase);

const SendMessage = ({
  receiverId,
  threadId,
  parentMessageId,
  originalSubject,
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    if (originalSubject) {
      const rePrefix = "Re: ";
      // Extract the base subject and count from the original subject
      const match = originalSubject.match(/Re: \((\d+)\) (.*)/);
      if (match) {
        const count = parseInt(match[1], 10) + 1;
        const baseSubject = match[2];
        setSubject(`${rePrefix}(${count}) ${baseSubject}`);
      } else {
        // Remove any existing "Re: " prefix and apply our format
        const cleanedSubject = originalSubject
          .replace(/^Re: \(\d+\) /, "")
          .replace(/^Re: /, "");
        setSubject(`${rePrefix}(1) ${cleanedSubject}`);
      }
    }
  }, [originalSubject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!threadId) {
      threadId = doc(collection(db, "threads")).id;
      console.log("Generated new thread ID on submit:", threadId);
    }
    console.log("Thread ID:", threadId); // Log threadId for debugging
    if (user && message && subject && threadId) {
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        receiverId,
        message,
        subject,
        threadId,
        parentMessageId,
        timestamp: Timestamp.now(),
      });
      setMessage("");
    } else {
      console.error("Some required fields are missing");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        required
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        required
      ></textarea>
      <button type="submit">Send Message</button>
    </form>
  );
};

export default SendMessage;
