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

const db = getFirestore(Firebase);

const SearchUsers = ({ onSelectUser }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
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
        if (lowercaseName.includes(lowercaseSearchTerm)) {
          users.push({ id: doc.id, ...userData });
        }
      });

      setResults(users);
    };

    handleSearch();
  }, [searchTerm]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users"
      />
      <ul>
        {results.map((user) => (
          <li key={user.id} onClick={() => onSelectUser(user)}>
            {user.name} ({user.role})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchUsers;

// import React, { useState, useEffect } from "react";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";
// import { Firebase } from "../firebase";
// import { useAuth } from "./AuthContext";

// const db = getFirestore(Firebase);

// const SearchUsers = ({ onSelectUser }) => {
//   const { user } = useAuth();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [results, setResults] = useState([]);

//   const handleSearch = async () => {
//     if (searchTerm.trim() === "") return;

//     // Temporarily allow all users to search each other
//     const q = query(
//       collection(db, "users"),
//       where("name", ">=", searchTerm),
//       where("name", "<=", searchTerm + "\uf8ff")
//     );

//     const querySnapshot = await getDocs(q);
//     const users = [];
//     querySnapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
//     setResults(users);
//   };

// const handleSearch = async () => {
//   if (searchTerm.trim() === "") return;

//   let q;
//   if (user.role === "doctor") {
//     // Doctors can search all users
//     q = query(
//       collection(db, "users"),
//       where("name", ">=", searchTerm),
//       where("name", "<=", searchTerm + "\uf8ff")
//     );
//   } else {
//     // Patients can only search for doctors
//     q = query(
//       collection(db, "users"),
//       where("role", "==", "doctor"),
//       where("name", ">=", searchTerm),
//       where("name", "<=", searchTerm + "\uf8ff")
//     );
//   }

//   const querySnapshot = await getDocs(q);
//   const users = [];
//   querySnapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
//   setResults(users);
// };

//   return (
//     <div>
//       <input
//         type="text"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         placeholder="Search users"
//       />
//       <button onClick={handleSearch}>Search</button>
//       <ul>
//         {results.map((user) => (
//           <li key={user.id} onClick={() => onSelectUser(user)}>
//             {user.name} ({user.role})
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default SearchUsers;
