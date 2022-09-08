import React, { useState } from "react";
import "./App.css";

import firebase, { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import firebaseConfig from "./firebase_config.json";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

type ChatMessage = {
  createdAt: Date;
  photoURL: string;
  text: string;
  uid: string;
  id?: string;
};

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };
  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function Message({ message }: { message: ChatMessage }) {
  const { text, uid, photoURL } = message;
  const messageClass = uid === auth?.currentUser?.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  );
}

function MessageList({ messages }: { messages: ChatMessage[] }) {
  console.log(messages);
  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => (
            <Message key={`${msg.createdAt}`} message={msg} />
          ))}
      </main>
    </>
  );
}

function ChatRoom() {
  const messagesQuery = query(
    collection(firestore, "messages"),
    orderBy("createdAt"),
    limit(25)
  );
  const [messages] = useCollectionData(messagesQuery);

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser!;
    await addDoc(collection(firestore, "messages"), {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue("");
  };
  return (
    <div>
      <MessageList messages={messages as ChatMessage[]} />
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        Header <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

export default App;
