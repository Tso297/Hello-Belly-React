import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { Firebase } from "./firebase";

const db = getFirestore(Firebase);

export const sendMessage = async (senderId, receiverId, message, threadId) => {
  try {
    await addDoc(collection(db, "messages"), {
      senderId,
      receiverId,
      message,
      threadId,
      timestamp: Timestamp.now(),
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const getMessages = async (threadId) => {
  const q = query(
    collection(db, "messages"),
    where("threadId", "==", threadId)
  );
  const querySnapshot = await getDocs(q);
  let messages = [];
  querySnapshot.forEach((doc) => {
    messages.push(doc.data());
  });
  return messages;
};
