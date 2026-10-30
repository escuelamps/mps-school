'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos de inactividad

export default function AdminInactivityProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef(null);

  useEffect(() => {
    // Solo aplica a las rutas del panel administrativo
    if (!pathname || !pathname.startsWith('/admin')) return;

    const logout = async () => {
      try {
        localStorage.removeItem('mps_admin_last_activity');
        await fetch('/api/auth/logout', { method: 'POST' });
        try { await signOut(auth); } catch (e) {}
        window.location.replace('/admin?timeout=true');
      } catch (err) {
        console.error('Error cerrando sesión por inactividad:', err);
      }
    };

    // 1. Verificar si al abrir/recargar o navegar hacia atrás ya expiró el tiempo
    const checkActivity = () => {
      const lastActive = localStorage.getItem('mps_admin_last_activity');
      const now = Date.now();

      if (!lastActive && pathname !== '/admin') {
        logout();
        return false;
      }

      if (lastActive) {
        const elapsed = now - parseInt(lastActive, 10);
        if (elapsed > INACTIVITY_TIMEOUT_MS) {
          logout();
          return false;
        }
      }
      return true;
    };

    if (!checkActivity()) return;

    localStorage.setItem('mps_admin_last_activity', Date.now().toString());

    // 2. Temporizador activo que se reinicia con cualquier interacción del usuario
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      localStorage.setItem('mps_admin_last_activity', Date.now().toString());
      timerRef.current = setTimeout(logout, INACTIVITY_TIMEOUT_MS);
    };

    const handlePageShow = (event) => {
      checkActivity();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    window.addEventListener('pageshow', handlePageShow);

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [pathname, router]);

  return <>{children}</>;
}
