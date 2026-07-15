"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Lock, LogIn } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        // Registro
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Redirigir al inicio o dashboard
        router.push('/');
      } else {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('El correo electrónico ya está registrado.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--rich-black)', position: 'relative', overflow: 'hidden' }}>
      {/* BACKGROUND EFFECTS */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(0,222,133,0.1) 0%, transparent 70%)', zIndex: 0 }}></div>
      
      {/* HEADER SIMPLE */}
      <nav style={{ padding: '2rem 5%', position: 'relative', zIndex: 10 }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='white'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-secondary)'}>
          <ArrowLeft size={20} /> Volver al Inicio
        </Link>
      </nav>

      {/* LOGIN BOX */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 10 }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.02)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '3rem',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <img src="/images/logo2.png" alt="MPS Escuela Logo" style={{ height: '95px', objectFit: 'contain', margin: '0 auto 1rem auto', display: 'block' }} />
            <h1 style={{ fontSize: '1.5rem', color: 'white', margin: 0 }}>{isRegistering ? 'Crear Cuenta' : 'Portal Estudiantil'}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{isRegistering ? 'Regístrate para comenzar tu viaje.' : 'Ingresa a tus clases y progreso.'}</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && (
              <div style={{ padding: '1rem', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', borderRadius: '8px', color: '#ff4444', fontSize: '0.9rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
            {isRegistering && (
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre Completo</label>
                <div style={{ position: 'relative' }}>
                  <User size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    required
                    style={{
                      width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                      color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s'
                    }}
                    onFocus={(e)=>e.currentTarget.style.borderColor='var(--accent)'}
                    onBlur={(e)=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>
            )}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <User size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="estudiante@correo.com"
                  required
                  style={{
                    width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                    color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s'
                  }}
                  onFocus={(e)=>e.currentTarget.style.borderColor='var(--accent)'}
                  onBlur={(e)=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                    color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s'
                  }}
                  onFocus={(e)=>e.currentTarget.style.borderColor='var(--accent)'}
                  onBlur={(e)=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.1rem', marginTop: '1rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              <LogIn size={20} /> {loading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Entrar al Portal')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button type="button" onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold' }}>
              {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
            {!isRegistering && (
              <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='white'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-secondary)'}>¿Olvidaste tu contraseña?</a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
