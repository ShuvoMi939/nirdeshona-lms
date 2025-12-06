// src/lib/firebaseClient.ts
"use client";

import { auth } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";

let currentUser: User | null = null;

// Track user state
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// Return currently signed-in user
export function getCurrentUser() {
  return currentUser;
}

// Return Firebase ID Token for protected API calls
export async function getIdToken(): Promise<string> {
  if (!currentUser) {
    const user = auth.currentUser;
    if (user) currentUser = user;
  }

  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  const token = await currentUser.getIdToken();
  return token;
}
