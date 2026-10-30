'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Calendar, LogOut, Wallet, Lock, User, Key, ArrowRight, Eye, EyeOff, FileSpreadsheet, Users, ClipboardCheck, BookOpen, ExternalLink, X } from 'lucide-react';
import './admin.css';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

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
  const [showTeacherTools, setShowTeacherTools] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('timeout') === 'true') {
        setError('Tu sesión ha expirado, por favor ingresa de nuevo');
        setUsername(null);
        setLoadingSession(false);
        localStorage.removeItem('mps_admin_last_activity');
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        try { auth.signOut(); } catch(e) {}
        return;
      }
    }

    // Comprobar si ya está logueado al cargar
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          setUsername(data.username);
        } else {
          setUsername(null);
        }
        setLoadingSession(false);
      })
      .catch(err => {
        console.error("Error al obtener sesión:", err);
        setUsername(null);
        setLoadingSession(false);
      });
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      // 1. Iniciar sesión con Firebase Auth
      const email = loginUsername.includes('@') ? loginUsername : `${loginUsername}@escuelamps.com`;
      const userCredential = await signInWithEmailAndPassword(auth, email, loginPassword);
      
      // 2. Obtener el Token de Seguridad
      const token = await userCredential.user.getIdToken();

      // 3. Enviar el Token al servidor Next.js para crear la sesión (cookie)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsername(data.username);
        router.refresh();
      } else {
        setError(data.message || 'Credenciales inválidas o no eres administrador');
        // Cerrar sesión en Firebase si el servidor rechaza (ej. no es admin)
        await auth.signOut();
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo es inválido.');
      } else {
        setError('Error de conexión. Intenta de nuevo.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch(e) { console.error("Firebase logout error", e); }
    localStorage.removeItem('mps_admin_last_activity');
    await fetch('/api/auth/logout', { method: 'POST' });
    setUsername(null);
    setLoginUsername('');
    setLoginPassword('');
    window.location.replace('/admin');
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
    <div style={{ minHeight: '100vh', width: '100%', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Barra superior con navegación y cerrar sesión */}
      <header style={{
        width: '100%',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--glass-border)',
        background: 'var(--panel-bg)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00DE85' }}></div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
            ESCUELA MPS <span style={{ opacity: 0.5, fontWeight: 400, marginLeft: '0.25rem' }}>| Panel de Administración</span>
          </span>
        </div>

        <button 
          onClick={handleLogout}
          style={{ 
            background: 'rgba(239, 68, 68, 0.08)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#ef4444', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </header>

      {/* Contenido principal */}
      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2.5rem 2rem 5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Hola, <span style={{ color: 'var(--accent, #00DE85)' }}>{username}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            ¿A qué módulo deseas entrar hoy?
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: username === 'juanse' 
            ? 'repeat(auto-fit, minmax(280px, 1fr))' 
            : 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          maxWidth: username === 'juanse' ? '700px' : '1100px',
          justifyContent: 'center'
        }}>
          
          {/* ================= VISTA DE JUANSE / LAURA PINEDA (PROFESORES Y CLASES) ================= */}
          {(username === 'juanse' || username === 'lpineda') && (
            <>
              {/* Card Profesores */}
              <div 
                onClick={() => router.push('/admin/nosotros')}
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px',
                  padding: '2rem 1.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <User size={30} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Profesores</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.45 }}>Directorio general de todos los profesores y gestión docente.</p>
              </div>

              {/* Card Planillas y Clases MPS */}
              <div 
                onClick={() => setShowTeacherTools(true)}
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px',
                  padding: '2rem 1.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <ClipboardCheck size={30} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Planillas y Clases MPS</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.45 }}>Registro de planillas docentes, firmas y seguimiento de Clases MPS.</p>
              </div>
            </>
          )}

          {/* ================= VISTA DE WILLIAM / LAURA PINEDA (ESTUDIANTES Y GESTIÓN) ================= */}
          {(username === 'william' || username === 'lpineda') && (
            <>
              {/* Card Estudiantes Activos */}
              <div 
                onClick={() => router.push('/admin/estudiantes-activos')}
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px',
                  padding: '2rem 1.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Users size={30} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Estudiantes Activos</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.45 }}>Directorio oficial y estado actual de los estudiantes.</p>
              </div>

              {/* Card Matrículas */}
              <div 
                onClick={() => router.push('/admin/matriculas')}
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px',
                  padding: '2rem 1.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <FileSpreadsheet size={30} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Matrículas</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.45 }}>Consolidado y registro oficial de matrículas de la escuela.</p>
              </div>

              {/* Card Agenda MPS (Horarios Clases) */}
              <div 
                onClick={() => router.push('/admin/agenda')}
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px',
                  padding: '2rem 1.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Calendar size={30} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Agenda MPS (Horarios)</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.45 }}>Configura las clases disponibles y cupos de la escuela.</p>
              </div>

              {/* Card Reservas y Pagos */}
              <div 
                onClick={() => router.push('/admin/reservas')}
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px',
                  padding: '2rem 1.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#dcf8c6', color: '#09624C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Calendar size={30} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Reservas y Pagos</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.45 }}>Aprobación y verificación de comprobantes Nequi y pagos.</p>
              </div>

              {/* Card Cenas MPS */}
              <div 
                onClick={() => router.push('/admin/cenas')}
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px',
                  padding: '2rem 1.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Cenas MPS</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.45 }}>Control de reservas, opciones de menú y pagos de la cena especial.</p>
              </div>

              {/* Card Atención WhatsApp */}
              <div 
                onClick={() => router.push('/admin/chats')}
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px',
                  padding: '2rem 1.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <MessageSquare size={30} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Atención WhatsApp</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.45 }}>Supervisión de chats en vivo y atención a estudiantes.</p>
              </div>
            </>
          )}

          {/* ================= VISTA DE LAURA PINEDA (CONTABILIDAD CENTRAL) ================= */}
          {username === 'lpineda' && (
            <div 
              onClick={() => router.push('/admin/contabilidad')}
              style={{
                background: 'var(--panel-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.06)';
              }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#fef08a', color: '#854d0e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Wallet size={30} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Contabilidad</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.45 }}>Control financiero, liquidación de profesores, gestión de estudiantes y cuentas de cobro.</p>
            </div>
          )}

        </div>
      </main>

      {/* Modal de Herramientas de Profesores para Juanse */}
      {showTeacherTools && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '550px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <button
              onClick={() => setShowTeacherTools(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>

            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Planillas y Herramientas Docentes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Accesos directos para control y seguimiento de clases:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                onClick={() => {
                  setShowTeacherTools(false);
                  router.push('/admin/planillas/registro');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 222, 133, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ClipboardCheck size={20} color="#00DE85" /> Formulario de Registro de Planilla
                </span>
                <ArrowRight size={16} color="#00DE85" />
              </div>

              <div
                onClick={() => {
                  setShowTeacherTools(false);
                  router.push('/admin/planillas/respuestas');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileSpreadsheet size={20} color="#38bdf8" /> Ver Respuestas y Firmas de Planillas
                </span>
                <ArrowRight size={16} color="#38bdf8" />
              </div>

              <div
                onClick={() => {
                  setShowTeacherTools(false);
                  router.push('/admin/classroom');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <BookOpen size={20} color="#a855f7" /> Clases MPS (Procesos)
                </span>
                <ArrowRight size={16} color="#a855f7" />
              </div>

              <div
                onClick={() => {
                  setShowTeacherTools(false);
                  router.push('/admin/nosotros');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Users size={20} color="#f59e0b" /> Base de Datos Profesores
                </span>
                <ArrowRight size={16} color="#f59e0b" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
