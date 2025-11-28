"use client";

import { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvLwksfj-l0J7AJRAX6QCxS-QZnQ3bubU",
  authDomain: "safety-nexus-d6aab.firebaseapp.com",
  projectId: "safety-nexus-d6aab",
  storageBucket: "safety-nexus-d6aab.firebasestorage.app",
  messagingSenderId: "1015104343382",
  appId: "1:1015104343382:web:acdebf891812cc3df4daf7",
};

export default function TestFirebase() {
  const [logs, setLogs] = useState<string[]>([]);
  const [email, setEmail] = useState("admin@safety-nexus.com");
  const [password, setPassword] = useState("Admin@2025@3241");

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs((prev) => [...prev, `${new Date().toISOString().slice(11, 19)} - ${msg}`]);
  };

  const testConnection = async () => {
    setLogs([]);
    addLog("Starting Firebase test...");

    try {
      // Initialize Firebase
      addLog("Initializing Firebase app...");
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      addLog("✅ Firebase app initialized");

      // Get Firestore - use "testdb" database
      addLog("Getting Firestore instance (testdb)...");
      const db = getFirestore(app, "testdb");
      addLog("✅ Firestore instance obtained");

      // Test reading companies collection
      addLog("Testing Firestore read (companies collection)...");
      try {
        const companiesRef = collection(db, "companies");
        const snapshot = await getDocs(companiesRef);
        addLog(`✅ Firestore read successful! Found ${snapshot.size} companies`);
        snapshot.forEach((doc) => {
          addLog(`   - Company: ${doc.id} = ${JSON.stringify(doc.data().name || doc.data())}`);
        });
      } catch (err: any) {
        addLog(`❌ Firestore read failed: ${err.message}`);
        addLog(`   Error code: ${err.code}`);
      }

      // Test Auth
      addLog("Testing Firebase Auth...");
      const auth = getAuth(app);
      try {
        addLog(`Signing in with ${email}...`);
        const credential = await signInWithEmailAndPassword(auth, email, password);
        addLog(`✅ Auth successful! User: ${credential.user.uid}`);

        // Now test reading user document
        addLog("Testing user document read...");
        const userDoc = await getDoc(doc(db, "users", credential.user.uid));
        if (userDoc.exists()) {
          addLog(`✅ User document found: ${JSON.stringify(userDoc.data())}`);
        } else {
          addLog("❌ User document NOT found in Firestore");
        }
      } catch (err: any) {
        addLog(`❌ Auth failed: ${err.message}`);
        addLog(`   Error code: ${err.code}`);
      }
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
    }

    addLog("Test complete.");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
      
      <div className="mb-4 space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border p-2 rounded w-full"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        onClick={testConnection}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Test Firebase Connection
      </button>

      <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-96">
        {logs.length === 0 ? (
          <p className="text-gray-500">Click the button to test Firebase connection...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={log.includes("❌") ? "text-red-400" : log.includes("✅") ? "text-green-400" : "text-gray-300"}>
              {log}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Project ID:</strong> {firebaseConfig.projectId}</p>
        <p><strong>Auth Domain:</strong> {firebaseConfig.authDomain}</p>
      </div>
    </div>
  );
}

