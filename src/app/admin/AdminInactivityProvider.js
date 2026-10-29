'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
        router.push('/admin');
        router.refresh();
      } catch (err) {
        console.error('Error cerrando sesión por inactividad:', err);
      }
    };

    // 1. Verificar si al abrir/recargar ya expiró el tiempo de inactividad
    const lastActive = localStorage.getItem('mps_admin_last_activity');
    const now = Date.now();

    if (lastActive) {
      const elapsed = now - parseInt(lastActive, 10);
      if (elapsed > INACTIVITY_TIMEOUT_MS) {
        logout();
        return;
      }
    }

    localStorage.setItem('mps_admin_last_activity', now.toString());

    // 2. Temporizador activo que se reinicia con cualquier interacción del usuario
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      localStorage.setItem('mps_admin_last_activity', Date.now().toString());
      timerRef.current = setTimeout(logout, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [pathname, router]);

  return <>{children}</>;
}
