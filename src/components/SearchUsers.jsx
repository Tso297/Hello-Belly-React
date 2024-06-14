import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import "../CSS/searchUsers.css";

const SearchUsers = ({ onSelectUser }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleSearch = async () => {
      if (!user || searchTerm.trim() === "") {
        setResults([]);
        return;
      }

      const lowercaseSearchTerm = searchTerm.toLowerCase();

      try {
        const response = await fetch(`https://hello-belly-flask-1.onrender.com/api/search_users?term=${lowercaseSearchTerm}`);
        const data = await response.json();
        setResults(data.results);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    };

    handleSearch();
  }, [searchTerm, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchTerm("");
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="userSearchContainer" ref={searchContainerRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setResults([]);
        }}
        placeholder="Search users..."
      />
      {searchTerm && (
        <ul>
          {results.map((resultUser) => (
            <li key={resultUser.id} onClick={() => onSelectUser(resultUser)}>
              {resultUser.name || resultUser.email} ({resultUser.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchUsers;