// services/firebaseService.js
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Save message to Firebase
export const saveMessage = async (contactId, message) => {
  try {
    const messagesRef = collection(db, 'chats', contactId, 'messages');
    await addDoc(messagesRef, {
      ...message,
      timestamp: serverTimestamp(),
      createdAt: new Date(),
    });
    console.log('Message saved to Firebase');
  } catch (error) {
    console.error('Error saving message:', error);
  }
};

// Listen to messages from Firebase
export const subscribeToMessages = (contactId, callback) => {
  const messagesRef = collection(db, 'chats', contactId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(messages);
  });
};