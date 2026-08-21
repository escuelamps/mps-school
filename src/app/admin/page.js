'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Calendar, LogOut, Wallet, Lock, User, Key, ArrowRight, Eye, EyeOff } from 'lucide-react';
import './admin.css';

export default function AdminPage() {
  const router = useRouter();
  
  // Estado de Autenticación
  const [username, setUsername] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Estado del Formulario de Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Comprobar si ya está logueado al cargar
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          setUsername(data.username);
        }
        setLoadingSession(false);
      })
      .catch(err => {
        console.error("Error al obtener sesión:", err);
        setLoadingSession(false);
      });
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsername(data.username);
        router.refresh();
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUsername(null);
    setLoginUsername('');
    setLoginPassword('');
    router.refresh();
  };

  if (loadingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  // SI NO ESTÁ LOGUEADO: Mostrar Login
  if (!username) {
    return (
      <div className="login-container">
        <div className="login-bg-glow"></div>
        <div className="login-content">
          <div className="login-icon-box">
            <Lock size={32} color="#00DE85" />
          </div>
          
          <h2 className="login-title">Acceso Restringido</h2>
          <p className="login-subtitle">Escuela MPS - Dashboard de Administración</p>
          
          <div className="login-card">
            <form onSubmit={handleLoginSubmit}>
              {error && (
                <div className="login-error">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Usuario</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="login-input"
                    placeholder="usuario"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <Key size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="login-input"
                    placeholder="••••••••"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoggingIn} className="login-button">
                {isLoggingIn ? (
                  <span>Autenticando...</span>
                ) : (
                  <>Entrar al Dashboard <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // SI ESTÁ LOGUEADO: Mostrar Hub
  return (
    <div className="dash-container" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
        <button 
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>

      <h1 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', marginBottom: '1rem', color: '#000F11' }}>
        Hola, <span style={{ color: 'var(--accent, #00DE85)' }}>{username}</span>
      </h1>
      <p style={{ color: '#64748b', marginBottom: '3rem', fontSize: '1.1rem' }}>
        ¿A qué módulo deseas entrar hoy?
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Card Agenda MPS */}
        <div 
          onClick={() => router.push('/admin/reservas')}
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            width: '320px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#dcf8c6', color: '#09624C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Calendar size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#000F11' }}>Agenda MPS</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Gestión de citas, profesores, comprobantes Nequi e Inteligencia Artificial.</p>
        </div>

        {/* Card WhatsApp Bot */}
        <div 
          onClick={() => router.push('/admin/chats')}
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            width: '320px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <MessageSquare size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#000F11' }}>WhatsApp Bot</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Supervisión de chats en vivo, control del bot de ventas y atención humana.</p>
        </div>

        {/* Card Cenas MPS (Visible para todos) */}
        <div 
          onClick={() => router.push('/admin/cenas')}
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            width: '320px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#000F11' }}>Cenas MPS</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Control de reservas, opciones de menú y pagos de la cena especial.</p>
        </div>

        {/* Card Contabilidad (Sólo lpineda) */}
        {username === 'lpineda' && (
          <div 
            onClick={() => router.push('/admin/contabilidad')}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              width: '320px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fef08a', color: '#854d0e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Wallet size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#000F11' }}>Contabilidad</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Control financiero, revisión de ingresos y gestión contable de MPS.</p>
          </div>
        )}

      </div>
    </div>
  );
}
