import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import SendMessage from "./SendMessage";
import Messages from "./Messages";
import SearchUsers from "./SearchUsers";

const DoctorPatientSession = ({ meetingNumber }) => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <div>
      <h2>Doctor-Patient Session</h2>
      <Messages threadId={meetingNumber} />
      {user && (
        <div>
          <SearchUsers onSelectUser={handleSelectUser} />
          {selectedUser && (
            <SendMessage
              receiverId={selectedUser.id}
              threadId={meetingNumber}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorPatientSession;
