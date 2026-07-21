"use client";
import { useEffect } from "react";
import { analytics } from "@/lib/firebase";

export default function FirebaseAnalytics() {
  useEffect(() => {
    // This empty effect ensures that the firebase module is imported 
    // and executed on the client side, which triggers the Analytics initialization.
    if (analytics) {
      console.log("Firebase Analytics initialized");
    }
  }, []);

  return null;
}
