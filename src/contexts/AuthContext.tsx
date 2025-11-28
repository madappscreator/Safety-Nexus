"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, UserRole, Company } from "@/types";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  companyCode?: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  userProfile: UserProfile | null;
  company: Company | null;
  loading: boolean;
  isPlatformAdmin: boolean;
  isCompanyAdmin: boolean;
  login: (email: string, password: string, companyCode?: string) => Promise<void>;
  register: (email: string, password: string, name: string, companyCode: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const isPlatformAdmin = user?.role === "platform_admin";
  const isCompanyAdmin = user?.role === "company_admin" || isPlatformAdmin;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            const userData = { uid: fbUser.uid, ...userDoc.data() } as User;
            setUser(userData);

            // Fetch company data
            let companyName = "";
            let companyCode = "";
            if (userData.companyId) {
              const companyDoc = await getDoc(doc(db, "companies", userData.companyId));
              if (companyDoc.exists()) {
                const companyData = { id: companyDoc.id, ...companyDoc.data() } as Company;
                setCompany(companyData);
                companyName = companyData.name || "";
                companyCode = companyData.code || "";
              }
            }

            // Set userProfile with company info
            setUserProfile({
              uid: userData.uid,
              email: userData.email,
              displayName: userData.displayName,
              role: userData.role,
              companyId: userData.companyId,
              companyName,
              companyCode,
            });
          } else {
            setUser(null);
            setUserProfile(null);
            setCompany(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
          setUserProfile(null);
          setCompany(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setCompany(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, companyCode?: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", credential.user.uid));

    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error("User profile not found. Contact your administrator.");
    }

    const userData = userDoc.data();

    // Check if user is active
    if (!userData.isActive) {
      await signOut(auth);
      throw new Error("Your account is deactivated. Contact your administrator.");
    }

    // Platform admin can login without company code
    if (userData.role === "platform_admin") {
      await setDoc(doc(db, "users", credential.user.uid), { lastSeen: serverTimestamp() }, { merge: true });
      return;
    }

    // Verify company code if provided (required for non-platform admins)
    if (companyCode) {
      const companyDoc = await getDoc(doc(db, "companies", userData.companyId));
      if (!companyDoc.exists()) {
        await signOut(auth);
        throw new Error("Company not found. Contact your administrator.");
      }
      if (companyDoc.data().code !== companyCode) {
        await signOut(auth);
        throw new Error("Invalid company code");
      }
      if (!companyDoc.data().isActive) {
        await signOut(auth);
        throw new Error("Company subscription is inactive. Contact support.");
      }
    }

    // Update last seen
    await setDoc(doc(db, "users", credential.user.uid), { lastSeen: serverTimestamp() }, { merge: true });
  };

  const register = async (email: string, password: string, name: string, companyCode: string) => {
    // Find company by code
    const companiesRef = collection(db, "companies");
    const q = query(companiesRef, where("code", "==", companyCode), where("isActive", "==", true));
    const companiesSnap = await getDocs(q);

    if (companiesSnap.empty) {
      throw new Error("Invalid or inactive company code");
    }

    const companyDoc = companiesSnap.docs[0];
    const companyData = companyDoc.data();

    // Check if self-registration is allowed
    if (!companyData.settings?.allowSelfRegister) {
      throw new Error("Self-registration is not allowed for this company. Contact your administrator.");
    }

    // Create Firebase Auth user
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    // Create user profile in Firestore
    await setDoc(doc(db, "users", credential.user.uid), {
      uid: credential.user.uid,
      email,
      displayName: name,
      companyId: companyDoc.id,
      role: "worker" as UserRole,
      isActive: true,
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
    });
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, userProfile, company, loading, isPlatformAdmin, isCompanyAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

