"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

// Map Firebase error codes to user-friendly messages
const firebaseErrorMap: { [key: string]: string } = {
  "auth/email-already-in-use": "This email is already registered. Please login or use another email.",
  "auth/invalid-email": "The email address is invalid. Please check and try again.",
  "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
  "auth/network-request-failed": "Network error. Please check your internet connection.",
};

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Email/Password Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role: "subscriber",
        createdAt: new Date(),
      });

      await sendEmailVerification(user);
      await auth.signOut();

      setMessage("Account created! Please check your email to verify your account.");
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: any) {
      const friendlyMessage = firebaseErrorMap[err.code] || "Something went wrong. Please try again.";
      setError(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Sign Up
  const handleGoogleSignup = async () => {
    setError("");
    setMessage("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: "subscriber",
        createdAt: new Date(),
      });

      router.push("/dashboard");
    } catch (err) {
      setError("Google sign-up failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
        <div className="w-full max-w-[350px] flex flex-col gap-5">
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="w-6 h-6 relative">
              <Image
                src="/ni-fav.svg"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            Nirdeshona Inc.
          </Link>

          {/* Card */}
          <div className="bg-white text-black flex flex-col gap-5 rounded-xl border-1 border-[oklch(92.9%_.013_255.508)] py-6 shadow-sm">
            {/* Title */}
            <div className="text-center px-6 border-b-[1.5px] border-b-[oklch(92.9%_.013_255.508)] pb-3">
              <h1 className="font-semibold text-xl">Create your account</h1>
              <p className="text-sm text-gray-500">Fill in the form to register</p>
            </div>

            <div className="px-6">
              <form onSubmit={handleRegister} className="grid gap-4" noValidate autoComplete="off">
                {/* Name */}
                <div className="floating-label-group grid gap-1">
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=" "
                    className="px-3 py-1 rounded-md border h-10 text-md w-full border-gray-300"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="name" className="text-sm text-gray-600">
                    Full Name
                  </label>
                </div>

                {/* Email */}
                <div className="floating-label-group grid gap-1">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    autoComplete="email"
                    className="px-3 py-1 rounded-md border h-10 text-md w-full border-gray-300"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="email" className="text-sm text-gray-600">
                    Email
                  </label>
                </div>

                {/* Password */}
                <div className="floating-label-group grid gap-1 relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    autoComplete="new-password"
                    className="px-3 py-1 rounded-md border h-10 text-md w-full border-gray-300"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="password" className="text-sm text-gray-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2.5 text-gray-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>

                {/* Error or Success */}
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                {message && <p className="text-sm text-green-600 text-center">{message}</p>}

                {/* Register Button */}
                <button
                  type="submit"
                  className="bg-green-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-green-700 transition w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Register"}
                </button>

                {/* Google Signup */}
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 transition w-full flex items-center justify-center gap-2"
                >
                  <img src="/google-icon.svg" alt="Google" className="w-5 h-5" /> Sign up with Google
                </button>

                {/* Login Link */}
                <div className="flex items-center justify-center text-sm text-gray-700 gap-2 -mx-6 pt-3 border-t-[1.5px] border-t-[oklch(92.9%_.013_255.508)]">
                  Already have an account?
                  <Link href="/auth/login" className="underline underline-offset-4 text-green-600">
                    Login
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-gray-500 text-center text-xs">
            By registering, you agree to our
            <br />
            <Link href="/terms" className="hover:text-green-600 underline underline-offset-4">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:text-green-600 underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
