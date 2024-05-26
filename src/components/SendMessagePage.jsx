import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import SendMessage from "./SendMessage";
import Messages from "./Messages";
import SearchUsers from "./SearchUsers";
import { Firebase } from "../firebase";

const db = getFirestore(Firebase);

const SendMessagePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [parentMessageId, setParentMessageId] = useState(null);
  const [originalSubject, setOriginalSubject] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const receiverId = params.get("receiverId");
    let threadId = params.get("threadId");
    const parentMsgId = params.get("parentMessageId");
    const origSubject = params.get("subject");

    if (receiverId) {
      if (!threadId) {
        threadId = doc(collection(db, "threads")).id;
        console.log("Generated new thread ID:", threadId);
      }
      setSelectedUser({ id: receiverId, threadId });
      console.log("Selected user and thread ID:", { id: receiverId, threadId });
    }

    if (parentMsgId) {
      setParentMessageId(parentMsgId);
    }
    if (origSubject) {
      let newSubject = origSubject;
      const rePrefix = "Re: ";
      // Extract the base subject and count from the original subject
      const match = origSubject.match(/Re: \((\d+)\) (.*)/);
      if (match) {
        const count = parseInt(match[1], 10) + 1;
        const baseSubject = match[2];
        newSubject = `${rePrefix}(${count}) ${baseSubject}`;
      } else {
        // Remove any existing "Re: " prefix and apply our format
        const cleanedSubject = origSubject
          .replace(/^Re: \(\d+\) /, "")
          .replace(/^Re: /, "");
        newSubject = `${rePrefix}(1) ${cleanedSubject}`;
      }
      setOriginalSubject(newSubject);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchUserName = async () => {
      if (selectedUser) {
        const userDoc = await getDoc(doc(db, "users", selectedUser.id));
        if (userDoc.exists()) {
          setSelectedUserName(userDoc.data().name || userDoc.data().email);
        }
      }
    };
    fetchUserName();
  }, [selectedUser]);

  return (
    <div>
      <h2>Send Message</h2>
      {user && (
        <div>
          {selectedUser ? (
            <div>
              <h3>Chat with {selectedUserName}</h3>
              <Messages threadId={selectedUser.threadId} />
              <SendMessage
                receiverId={selectedUser.id}
                threadId={selectedUser.threadId}
                parentMessageId={parentMessageId}
                originalSubject={originalSubject}
              />
            </div>
          ) : (
            <SearchUsers
              onSelectUser={(user) => {
                const threadId = doc(collection(db, "threads")).id;
                console.log(
                  "Generated new thread ID on user select:",
                  threadId
                );
                setSelectedUser({ ...user, threadId });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SendMessagePage;
