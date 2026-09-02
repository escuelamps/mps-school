'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Book, Calendar } from 'lucide-react';
import { auth } from '@/lib/firebase';

export default function StudentPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.username || data.role !== 'student') {
          router.push('/login');
        } else {
          setSession(data);
          setLoading(false);
        }
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await auth.signOut();
    router.push('/');
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--rich-black)', color: 'white' }}>Cargando portal...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--accent)' }}>Portal Estudiantil</h1>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Hola, {session.username}</h2>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--panel-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', width: '300px' }}>
          <Book size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <h3>Mis Clases</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Próximamente verás aquí tu historial de clases y notas.</p>
        </div>
        <div style={{ background: 'var(--panel-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', width: '300px' }}>
          <Calendar size={32} color="#0ea5e9" style={{ marginBottom: '1rem' }} />
          <h3>Agendar</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Próximamente podrás reservar tus clases desde aquí.</p>
        </div>
      </div>
    </div>
  );
}
