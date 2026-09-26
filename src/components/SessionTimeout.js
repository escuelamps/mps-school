"use client";

import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export default function SessionTimeout() {
  useEffect(() => {
    let timeoutId;
    let isLogged = false;

    // Listen to auth state to only track if user is actually logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        isLogged = true;
        resetTimer();
      } else {
        isLogged = false;
        clearTimeout(timeoutId);
      }
    });

    const handleLogout = async () => {
      try {
        await signOut(auth);
        window.location.href = '/login?timeout=true';
      } catch (err) {
        console.error('Error auto-logging out:', err);
      }
    };

    const resetTimer = () => {
      if (!isLogged) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    };

    const events = ['mousemove', 'keydown', 'wheel', 'DOMMouseScroll', 'mouseWheel', 'mousedown', 'touchstart', 'touchmove', 'scroll'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null; // This component doesn't render anything
}
