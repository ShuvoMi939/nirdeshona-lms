"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";

// Map Firebase error codes to user-friendly messages
const firebaseErrorMap: { [key: string]: string } = {
  "auth/email-already-in-use": "This email is already registered. Please login or use another email.",
  "auth/invalid-email": "The email address is invalid. Please check and try again.",
  "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
  "auth/network-request-failed": "Network error. Please check your internet connection.",
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role: "subscriber",
        createdAt: new Date()
      });

      await sendEmailVerification(user);
      await auth.signOut();

      setMessage("Account created! Please check your email to verify your account.");
      setIsRegistered(true);

      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      // Use friendly error message
      const friendlyMessage = firebaseErrorMap[err.code] || "Something went wrong. Please try again.";
      setError(friendlyMessage);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Create Account 🚀</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRegistered}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRegistered}
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                disabled={isRegistered}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              disabled={isRegistered}
            >
              Register
            </button>

            {/* Error or Success message below the submit button */}
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            {message && <p className="text-green-500 text-sm mt-2 text-center">{message}</p>}
          </form>

          {!isRegistered && (
            <p className="text-sm text-center mt-4">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-green-600 hover:underline">
                Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
