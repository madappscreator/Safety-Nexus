import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // For production, use environment variables
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID || "safety-nexus-d6aab",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@safety-nexus-d6aab.iam.gserviceaccount.com",
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

const db = admin.firestore();
const auth = admin.auth();

// Use the testdb database
db.settings({ databaseId: "testdb" });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName, role, companyId, phone } = body;

    // Validate required fields
    if (!email || !password || !displayName || !role || !companyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create user in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      // User exists, just update their Firestore doc
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        userRecord = await auth.createUser({
          email,
          password,
          displayName,
          emailVerified: false,
        });
      } else {
        throw err;
      }
    }

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, { companyId, role });

    // Create user document in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      companyId,
      phone: phone || "",
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ 
      success: true, 
      uid: userRecord.uid,
      message: "User created successfully" 
    });

  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to create user" 
    }, { status: 500 });
  }
}

