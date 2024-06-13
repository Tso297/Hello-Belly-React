import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Firebase } from "../firebase";
import { useAuth } from "./AuthContext";
import "../CSS/searchUsers.css";

const db = getFirestore(Firebase);

const SearchUsers = ({ onSelectUser }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!user || searchTerm.trim() === "") {
      setResults([]);
      return;
    }

    const handleSearch = async () => {
      const lowercaseSearchTerm = searchTerm.toLowerCase();

      const usersRef = collection(db, "users");
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const lowercaseName = userData.name ? userData.name.toLowerCase() : "";
        if (
          lowercaseName.includes(lowercaseSearchTerm) &&
          userData.uid !== user.uid // Exclude current user
        ) {
          users.push({ id: doc.id, ...userData });
        }
      });

      setResults(users);
    };

    handleSearch();
  }, [searchTerm, user]);

  return (
    <div className="userSearchContainer">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
      />
      <ul>
        {results.map((resultUser) => (
          <li key={resultUser.id} onClick={() => onSelectUser(resultUser)}>
            {resultUser.name} ({resultUser.role})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchUsers;