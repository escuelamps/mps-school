"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('timeout') === 'true') {
        setError('Tu sesión ha expirado, por favor ingresa de nuevo');
      }
    }
  }, []);

  const resolveEmailForLogin = async (rawIdentifier) => {
    const clean = rawIdentifier.trim();
    if (clean.includes('@')) {
      return clean;
    }

    const cleanPhone = clean.replace(/\D/g, '');
    const normalizeText = (t) => (t || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const searchName = normalizeText(clean);

    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(query(usersRef, where('role', '==', 'student')));
      
      let match = null;

      // 1. Coincidencia por teléfono (si tiene al menos 7 dígitos)
      if (cleanPhone.length >= 7) {
        match = snap.docs.find(d => {
          const data = d.data();
          const userPhone = (data.telefono || data.phone || data.celular || '').replace(/\D/g, '');
          return userPhone && userPhone.includes(cleanPhone);
        });
      }

      // 2. Coincidencia exacta o normalizada por nombre
      if (!match && searchName) {
        match = snap.docs.find(d => {
          const data = d.data();
          const docName = normalizeText(data.nombre || data.name || data.displayName || data.username || '');
          return docName === searchName;
        });
      }

      // 3. Coincidencia parcial por nombre
      if (!match && searchName.length >= 3) {
        match = snap.docs.find(d => {
          const data = d.data();
          const docName = normalizeText(data.nombre || data.name || data.displayName || data.username || '');
          return docName.includes(searchName) || searchName.includes(docName);
        });
      }

      if (match) {
        return match.data().email;
      }
    } catch (err) {
      console.error('Error buscando estudiante por nombre o celular:', err);
    }

    // Fallback con formato de correo interno
    if (searchName) {
      return `${clean.toLowerCase().replace(/\s+/g, '.')}@escuelamps.com`;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        // Registro
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // After register, generate token and set cookie
        const token = await userCredential.user.getIdToken();
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if(data.role === 'teacher') router.push('/teacher');
        else router.push('/student');
      } else {
        // Login
        const targetEmail = await resolveEmailForLogin(email);
        if (!targetEmail) {
          setError('No encontramos ningún estudiante registrado con ese nombre o número de celular.');
          setLoading(false);
          return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
        const token = await userCredential.user.getIdToken();
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if(data.role === 'teacher') router.push('/teacher');
        else if (data.role === 'admin') router.push('/admin');
        else router.push('/student');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('El correo electrónico ya está registrado.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        setError('Nombre, celular o contraseña incorrectos.');
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* BACKGROUND EFFECTS */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(0,222,133,0.1) 0%, transparent 70%)', zIndex: 0 }}></div>
      
      {/* HEADER SIMPLE */}
      <nav style={{ padding: '2rem 5%', position: 'relative', zIndex: 10 }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='var(--text-primary)'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-secondary)'}>
          <ArrowLeft size={20} /> Volver al Inicio
        </Link>
      </nav>

      {/* LOGIN BOX */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 10 }}>
        <div style={{ 
          background: 'var(--panel-bg)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          padding: '3rem',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <img src="/images/logo2.png" alt="MPS Escuela Logo" className="theme-invert" style={{ height: '95px', objectFit: 'contain', margin: '0 auto 1rem auto', display: 'block' }} />
            <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>{isRegistering ? 'Crear Cuenta' : 'Portal Estudiantil'}</h1>
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
                      width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'var(--bg-secondary)',
                      border: '1px solid var(--glass-border)', borderRadius: '12px',
                      color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s'
                    }}
                    onFocus={(e)=>e.currentTarget.style.borderColor='var(--accent)'}
                    onBlur={(e)=>e.currentTarget.style.borderColor='var(--glass-border)'}
                  />
                </div>
              </div>
            )}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {isRegistering ? 'Correo Electrónico' : 'Nombre o Número de Celular'}
              </label>
              <div style={{ position: 'relative' }}>
                <User size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type={isRegistering ? 'email' : 'text'} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRegistering ? 'estudiante@correo.com' : 'Ej: Juan Pérez o 3001234567'}
                  required
                  style={{
                    width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)', borderRadius: '12px',
                    color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s'
                  }}
                  onFocus={(e)=>e.currentTarget.style.borderColor='var(--accent)'}
                  onBlur={(e)=>e.currentTarget.style.borderColor='var(--glass-border)'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '1rem 3rem 1rem 3rem', background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)', borderRadius: '12px',
                    color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s'
                  }}
                  onFocus={(e)=>e.currentTarget.style.borderColor='var(--accent)'}
                  onBlur={(e)=>e.currentTarget.style.borderColor='var(--glass-border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
              <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='var(--text-primary)'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-secondary)'}>¿Olvidaste tu contraseña?</a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
