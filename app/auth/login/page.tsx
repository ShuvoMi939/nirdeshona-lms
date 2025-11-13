"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("rememberedEmail");
      const savedPassword = localStorage.getItem("rememberedPassword");
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendSuccess("");
    setUnverifiedUser(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const userQuery = query(collection(db, "users"), where("email", "==", email));
      const userSnap = await getDocs(userQuery);

      if (userSnap.empty) {
        setError("No account found with this email address.");
        setLoading(false);
        return;
      }

      const userData = userSnap.docs[0].data();

      if (userData.role === "admin") {
        setError("Admin accounts cannot log in from this page.");
        setLoading(false);
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          setError("This email is not yet verified. Please check your inbox (or spam folder) for the verification email, or click below to resend the link.");
          setUnverifiedUser({ email, password });
          setLoading(false);
          return;
        }

        if (rememberMe && typeof window !== "undefined") {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPassword", password);
        } else if (typeof window !== "undefined") {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }

        setLoading(false);
        router.push("/dashboard");
      } catch (authError: any) {
        setLoading(false);
        if (authError.code === "auth/wrong-password") {
          setError("Incorrect password. Please try again.");
        } else if (authError.code === "auth/user-not-found") {
          setError("No account found with this email address.");
        } else if (authError.code === "auth/too-many-requests") {
          setError("Too many failed attempts. Please try again later.");
        } else {
          setError("Login failed. Please try again.");
        }
      }
    } catch {
      setLoading(false);
      setError("Login failed. Please try again.");
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedUser) return;
    setError("");
    setResendSuccess("");
    setResendLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, unverifiedUser.email, unverifiedUser.password);
      const user = userCredential.user;

      if (user.emailVerified) {
        setResendSuccess("Your email is already verified. You can log in now.");
        setUnverifiedUser(null);
        setResendLoading(false);
        return;
      }

      await sendEmailVerification(user);
      setResendSuccess("Verification email sent! Please check your inbox.");
      setUnverifiedUser(null); // Hide button after success
    } catch (err) {
      setError("Failed to resend verification email. Please check your credentials and try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "Unnamed User",
          email: user.email,
          role: "subscriber",
          createdAt: new Date(),
        });
      }

      if (!user.emailVerified) {
        setError("Please verify your Google email before proceeding.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Google login failed. Please try again.");
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
              <h1 className="font-semibold text-xl">Welcome back</h1>
              <p className="text-sm text-gray-500">Login with your credentials</p>
            </div>

            <div className="px-6">
              <form onSubmit={handleLogin} className="grid gap-4" noValidate autoComplete="off">
                <FloatingLabelInput
                  label="Your Email"
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

                <div className="flex justify-between items-center text-sm -mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-gray-700"
                    />
                    Remember me
                  </label>
                  <Link href="/auth/reset-password" className="text-gray-700 hover:underline">Forgot password?</Link>
                </div>

                {/* Feedback messages with bordered div */}
                {(error || resendSuccess || unverifiedUser) && (
                  <div className="border bg-gray-100 border-gray-200 rounded-md p-3 flex flex-col gap-2">
                    {error && <p className="text-xs text-gray-700">{error}</p>}
                    {resendSuccess && <p className="text-xs text-gray-700">{resendSuccess}</p>}
                    {unverifiedUser && !resendSuccess && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className="text-xs text-gray-800 bg-gray-200 hover:bg-gray-300 rounded-md px-2 py-1 transition-colors duration-200 self-start disabled:opacity-60"
                      >
                        {resendLoading ? "Sending..." : "Resend verification email"}
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 transition w-full disabled:opacity-60"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

                <div className="relative flex items-center -my-2">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-2 text-gray-400 text-sm font-medium">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 transition w-full flex items-center justify-center gap-2"
                >
                  <img src="/google-icon.svg" alt="Google" className="w-5 h-5" /> Sign in with Google
                </button>

                <div className="flex items-center justify-center text-sm text-gray-700 gap-2 -mx-6 pt-3 border-t border-gray-200">
                  Don’t have an account?
                  <Link href="/auth/register" className="underline underline-offset-4 text-gray-800">Sign up</Link>
                </div>
              </form>
            </div>
          </div>

          <div className="text-gray-500 text-center text-xs">
            By clicking continue, you agree to our
            <br />
            <Link href="/terms" className="hover:text-blue-600 underline underline-offset-4">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:text-blue-600 underline underline-offset-4">Privacy Policy</Link>.
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
