import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export function ModalOverlay({ isOpen, onClose, children }) {
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
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setFormData({ name: '', email: '', password: '' });
      setIsLogin(true);
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!isLogin && !formData.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo válido.';
    }
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert(isLogin ? 'Iniciando sesión...' : 'Creando cuenta...');
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
        {isLogin ? 'Iniciar Sesión' : 'Registro'}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }} noValidate>
        {!isLogin && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent)' }}>Nombre completo</label>
            <input 
              name="name" value={formData.name} onChange={handleChange}
              type="text" 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.name ? '#ff6961' : 'rgba(0,222,133,0.3)'}`, color: 'white', outline: 'none' }} 
            />
            {errors.name && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14}/> {errors.name}</span>}
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
        
        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
          {isLogin ? 'Entrar' : 'Crear Cuenta'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
        {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
        <span 
          style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => {
            setIsLogin(!isLogin);
            setErrors({});
            setFormData({ name: '', email: '', password: '' });
          }}
        >
          {isLogin ? 'Regístrate' : 'Inicia Sesión'}
        </span>
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
