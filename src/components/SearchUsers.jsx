import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
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

      // Query users collection
      const usersRef = collection(db, "users");
      const usersQuery = query(usersRef);
      const usersSnapshot = await getDocs(usersQuery);

      // Query doctors collection
      const doctorsRef = collection(db, "doctors");
      const doctorsQuery = query(doctorsRef);
      const doctorsSnapshot = await getDocs(doctorsQuery);

      const combinedResults = [];

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const lowercaseName = userData.name ? userData.name.toLowerCase() : "";
        if (
          lowercaseName.includes(lowercaseSearchTerm) &&
          userData.uid !== user.uid // Exclude current user
        ) {
          combinedResults.push({ id: doc.id, ...userData });
        }
      });

      doctorsSnapshot.forEach((doc) => {
        const doctorData = doc.data();
        const lowercaseName = doctorData.name ? doctorData.name.toLowerCase() : "";
        if (lowercaseName.includes(lowercaseSearchTerm)) {
          combinedResults.push({ id: doc.id, ...doctorData, role: 'doctor' });
        }
      });

      setResults(combinedResults);
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
            {resultUser.name} ({resultUser.role || 'user'})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchUsers;