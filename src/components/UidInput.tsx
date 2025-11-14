"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function UsernameInput({
  currentUid,
  savedPublicUid,
  onUpdated,
}: {
  currentUid: string;
  savedPublicUid: string;
  onUpdated: (newUsername: string) => void;
}) {
  // Initialize username with savedPublicUid or fallback to currentUid
  const [username, setUsername] = useState<string>(savedPublicUid || currentUid);
  const [valid, setValid] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [btnState, setBtnState] = useState<"default" | "saving" | "saved">("default");

  const usernameRegex = /^[0-9a-zA-Z.]+$/;

  // Update username if savedPublicUid changes
  useEffect(() => {
    setUsername(savedPublicUid || currentUid);
  }, [savedPublicUid, currentUid]);

  // Debounced availability check
  useEffect(() => {
    const value = username.trim();

    if (!value) {
      setValid(false);
      setMessage("Choose a username");
      return;
    }

    if (savedPublicUid && value.toLowerCase() === savedPublicUid.toLowerCase()) {
      setValid(false);
      setMessage(""); // current username, no need to change
      return;
    }

    const timer = setTimeout(() => {
      checkAvailability(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, savedPublicUid, currentUid]);

  const checkAvailability = async (value: string) => {
    if (!usernameRegex.test(value)) {
      setValid(false);
      setMessage("Only letters, numbers, and dot are allowed.");
      return;
    }

    setChecking(true);

    try {
      const ref = collection(db, "users");
      const snap = await getDocs(ref);

      const exists = snap.docs.some((doc) => {
        const docUid = doc.data()?.publicUid;
        const docId = doc.id;

        // Ignore current user's own UID/publicUid
        if (
          docId.toLowerCase() === currentUid.toLowerCase() ||
          (savedPublicUid && docUid?.toLowerCase() === savedPublicUid.toLowerCase())
        ) {
          return false;
        }

        return (
          (docUid && docUid.toLowerCase() === value.toLowerCase()) ||
          docId.toLowerCase() === value.toLowerCase()
        );
      });

      if (exists) {
        setValid(false);
        setMessage("This username is already taken.");
      } else {
        // If user is using their own actual UID initially, just disable save
        const isOwnUid = value.toLowerCase() === currentUid.toLowerCase();
        setValid(!isOwnUid);
        setMessage(isOwnUid ? "" : "This username is available.");
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setValid(false);
      setMessage("Error checking username.");
    } finally {
      setChecking(false);
    }
  };

  const save = async () => {
    if (!valid) return;

    setBtnState("saving");

    try {
      await onUpdated(username.toLowerCase());

      setBtnState("saved");
      setTimeout(() => setBtnState("default"), 1500);
    } catch (error) {
      console.error(error);
      setBtnState("default");
    }
  };

  const buttonText = () => {
    if (btnState === "saving") return "Saving...";
    if (btnState === "saved") return "Saved!";
    return "Save";
  };

  return (
    <div>
      <h3 className="font-bold text-lg">Username</h3>

      <div className="flex items-center gap-3 mt-2">
        <input
          type="text"
          value={username || ""}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded-lg flex-1"
          placeholder="Enter your username"
        />

        {btnState === "saved" ? (
          <CheckCircleIcon className="w-7 h-7 text-blue-600 animate-pulse" />
        ) : (
          <CheckCircleIcon
            className={`w-7 h-7 transition ${
              valid && btnState === "default" ? "text-blue-600" : "text-gray-300"
            }`}
          />
        )}
      </div>

      {message && (
        <p className={`mt-1 ${valid ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      <button
        disabled={!valid || btnState === "saving"}
        onClick={save}
        className={`mt-3 px-4 py-2 rounded-lg text-white ${
          valid
            ? btnState === "saving"
              ? "bg-blue-500 cursor-wait"
              : "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {buttonText()}
      </button>
    </div>
  );
}
