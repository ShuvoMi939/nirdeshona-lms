"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Image from "next/image";

// Firebase error map
const firebaseErrorMap: { [key: string]: string } = {
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
  const [resendEmail, setResendEmail] = useState(false);
  const [resending, setResending] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResendEmail(false);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all the required fields.");
      return;
    }

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

      setMessage("Account created successfully! Please check your email to verify your account.");
      setTimeout(() => router.push("/auth/login"), 3500);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        try {
          const existingUser = await signInWithEmailAndPassword(auth, email, password);
          const user = existingUser.user;

          if (!user.emailVerified) {
            setMessage(
              "This email is already registered but not yet verified. Please check your inbox (or spam folder) for the verification email, or click below to resend the link."
            );
            setResendEmail(true);
            await auth.signOut();
            setIsSubmitting(false);
            return;
          }

          setError("This email is already registered and verified. Please log in instead.");
          await auth.signOut();
        } catch {
          setError("This email is already registered. Please log in instead.");
        }
      } else {
        const friendlyMessage = firebaseErrorMap[err.code] || "Something went wrong. Please try again.";
        setError(friendlyMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setResending(true);
    setMessage("Sending verification email...");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        setMessage("Your email is already verified. You can log in now.");
        setResendEmail(false);
        await auth.signOut();
        return;
      }

      await sendEmailVerification(user);
      setMessage("Verification email has been sent successfully. Please check your inbox or spam folder.");
      setResendEmail(false); // hide button after success
      await auth.signOut();
    } catch {
      setError("Failed to resend verification email. Please check your credentials or try again later.");
    } finally {
      setResending(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setMessage("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName || "Unnamed User",
        email: user.email,
        role: "subscriber",
        createdAt: new Date(),
      });

      router.push("/dashboard");
    } catch {
      setError("Google sign-up failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
        <div className="w-full max-w-[350px] flex flex-col gap-5">
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="bg-white w-[25px] h-[25px] relative rounded-lg border border-gray-200">
              <Image src="/ni-fav.svg" alt="Logo" fill className="object-contain p-[2px]" />
            </div>
            Nirdeshona Inc.
          </Link>

          <div className="bg-white text-black flex flex-col gap-5 rounded-xl border border-gray-200 py-6 shadow-sm">
            <div className="text-center px-6 border-b border-gray-200 pb-3">
              <h1 className="font-semibold text-xl">Create your account</h1>
              <p className="text-sm text-gray-500">Fill in the form to register</p>
            </div>

            <div className="px-6">
              <form onSubmit={handleRegister} className="grid gap-4" noValidate autoComplete="off">
                <FloatingLabelInput
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  name="name"
                  required
                />
                <FloatingLabelInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  required
                />
                <div className="relative">
                  <FloatingLabelInput
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-3 text-gray-500"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>

                {/* ✅ Resend section */}
                {(resendEmail || error || message) && (
                  <div className="border bg-gray-100 border-gray-200 rounded-md p-3 flex flex-col gap-2">
                    {error && <p className="text-xs text-gray-700">{error}</p>}

                    {/* Only show Sending... if resending */}
                    {resending ? (
                      <p className="text-xs text-gray-700">Sending...</p>
                    ) : (
                      <>
                        {message && <p className="text-xs text-gray-700">{message}</p>}
                        {resendEmail && (
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            className="text-xs text-gray-800 bg-gray-200 hover:bg-gray-300 rounded-md px-2 py-1 transition-colors duration-200 self-start disabled:opacity-60"
                          >
                            Resend verification email
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || resending}
                  className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 transition w-full disabled:opacity-60"
                >
                  {isSubmitting ? "Creating Account..." : "Register"}
                </button>

                <div className="relative flex items-center -my-2">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-2 text-gray-400 text-sm font-medium">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 transition w-full flex items-center justify-center gap-2"
                >
                  <img src="/google-icon.svg" alt="Google" className="w-5 h-5" /> Sign up with Google
                </button>

                <div className="flex items-center justify-center text-sm text-gray-700 gap-2 -mx-6 pt-3 border-t border-gray-200">
                  Already have an account?
                  <Link href="/auth/login" className="underline underline-offset-4 text-gray-800">
                    Login
                  </Link>
                </div>
              </form>
            </div>
          </div>

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
