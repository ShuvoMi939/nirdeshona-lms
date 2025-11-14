"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserProfile from "@/components/UserProfile";

type User = {
  uid: string;
  name: string;
  email?: string;
  role?: string;
  bio?: string;
  profilePhotoURL?: string;
  coverPhotoURL?: string;
  createdAt?: any;
  gender?: string;
  dob?: string;
  currentCity?: string;
  hometown?: string;
  education?: string;
  work?: string;
  contact?: string;
  publicUid?: string;
};

export default function PublicProfilePage() {
  const params = useParams();
  const uidParam = Array.isArray(params.uid) ? params.uid[0] : params.uid;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // ✅ Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setCurrentUserEmail(u?.email || null);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch user by UID or publicUid
  useEffect(() => {
    if (!uidParam) {
      setError("Invalid user ID.");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError("");

      try {
        // 1️⃣ Try fetching directly by UID (document ID)
        const uidRef = doc(db, "users", uidParam);
        let uidSnap = await getDoc(uidRef);

        if (uidSnap.exists()) {
          setUser({ uid: uidSnap.id, ...uidSnap.data() } as User);
          return;
        }

        // 2️⃣ If not found, try fetching by publicUid
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("publicUid", "==", uidParam));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const userDoc = snap.docs[0];
          setUser({ uid: userDoc.id, ...userDoc.data() } as User);
        } else {
          setError("User not found.");
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Error fetching user:", err);
        setError("Failed to fetch user data.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [uidParam]);

  const isCurrentUser = user?.email === currentUserEmail;

  return (
    <>
      <Navbar />

      {loading ? (
        <div className="flex justify-center items-center min-h-screen text-gray-500">
          Loading profile...
        </div>
      ) : error ? (
        <div className="flex justify-center items-center min-h-screen text-red-600">
          {error}
        </div>
      ) : user ? (
        <div className="min-h-screen bg-gray-50 pb-10">
          {/* Cover Photo */}
          <div className="relative h-56 sm:h-72 bg-gray-200">
            <img
              src={
                user.coverPhotoURL ||
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=1200&q=80"
              }
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <img
                src={
                  user.profilePhotoURL ||
                  "https://www.gravatar.com/avatar/?d=mp&s=200"
                }
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="mt-20 text-center px-4">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            {user.role && (
              <p className="text-gray-600 capitalize mt-1">
                {user.role.replace("-", " ")}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              Joined on{" "}
              {user.createdAt?.toDate?.()?.toLocaleDateString() || "Unknown date"}
            </p>
          </div>

          {/* Full Profile Info */}
          <div className="mt-10 max-w-4xl mx-auto px-4">
            <UserProfile user={user} editable={isCurrentUser} />
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen text-gray-500">
          No user data available.
        </div>
      )}

      <Footer />
    </>
  );
}
