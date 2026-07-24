"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, AlertCircle } from 'lucide-react';

export function ModalOverlay({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div 
        onClick={onClose}
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 15, 17, 0.8)', backdropFilter: 'blur(10px)'
        }}
      />
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 101 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function LoginModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setAuthError(null);
      setFormData({ email: '', password: '' });
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo válido.';
    }
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    
    if (validate()) {
      setLoading(true);
      try {
        const { auth } = await import('../lib/firebase');
        const { signInWithEmailAndPassword } = await import('firebase/auth');

        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        onClose();
        alert('¡Sesión iniciada con éxito!');
      } catch (err) {
        console.error(err);
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          setAuthError('Correo o contraseña incorrectos.');
        } else {
          setAuthError('Ocurrió un error inesperado. Inténtalo de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <h2 className="text-gradient" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>
        Iniciar Sesión
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }} noValidate>
        {authError && (
          <div style={{ padding: '0.8rem', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', borderRadius: '8px', color: '#ff4444', fontSize: '0.9rem', textAlign: 'center' }}>
            {authError}
          </div>
        )}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent)' }}>Correo Electrónico</label>
          <input 
            name="email" value={formData.email} onChange={handleChange}
            type="email" 
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.email ? '#ff6961' : 'rgba(0,222,133,0.3)'}`, color: 'white', outline: 'none' }} 
          />
          {errors.email && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14}/> {errors.email}</span>}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent)' }}>Contraseña</label>
          <input 
            name="password" value={formData.password} onChange={handleChange}
            type="password" 
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.password ? '#ff6961' : 'rgba(0,222,133,0.3)'}`, color: 'white', outline: 'none' }} 
          />
          {errors.password && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14}/> {errors.password}</span>}
        </div>
        
        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Procesando...' : 'Entrar'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
        ¿No tienes cuenta?{' '}
        <Link href="/registro" style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }} onClick={onClose}>
          Regístrate aquí
        </Link>
      </p>
    </ModalOverlay>
  );
}

export function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setFormData({ name: '', email: '', message: '' });
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo válido.';
    }
    if (!formData.message.trim()) newErrors.message = 'El mensaje no puede estar vacío.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const text = `Hola, mi nombre es ${formData.name.trim()}.\nMi correo es ${formData.email.trim()}.\n\nMensaje:\n${formData.message.trim()}`;
      const whatsappUrl = `https://wa.me/573008934407?text=${encodeURIComponent(text)}`;
      
      // Abre WhatsApp en una nueva pestaña
      window.open(whatsappUrl, '_blank');
      
      setFormData({ name: '', email: '', message: '' });
      onClose();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <h2 className="text-gradient" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1rem' }}>Hablemos</h2>
      <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '2rem', fontSize: '0.9rem' }}>Déjanos un mensaje y te contactaremos pronto.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }} noValidate>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent)' }}>Nombre</label>
          <input 
            name="name" value={formData.name} onChange={handleChange}
            type="text" 
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.name ? '#ff6961' : 'rgba(0,222,133,0.3)'}`, color: 'white', outline: 'none' }} 
          />
          {errors.name && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14}/> {errors.name}</span>}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent)' }}>Email</label>
          <input 
            name="email" value={formData.email} onChange={handleChange}
            type="email" 
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.email ? '#ff6961' : 'rgba(0,222,133,0.3)'}`, color: 'white', outline: 'none' }} 
          />
          {errors.email && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14}/> {errors.email}</span>}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent)' }}>Mensaje</label>
          <textarea 
            name="message" value={formData.message} onChange={handleChange}
            rows="3" 
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.message ? '#ff6961' : 'rgba(0,222,133,0.3)'}`, color: 'white', outline: 'none', resize: 'none' }}
          ></textarea>
          {errors.message && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14}/> {errors.message}</span>}
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>Enviar Mensaje</button>
      </form>
    </ModalOverlay>
  );
}
