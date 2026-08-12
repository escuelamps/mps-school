'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Key, ArrowRight } from 'lucide-react';
import '../admin.css';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/chats');
        router.refresh();
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-glow"></div>

      <div className="login-content">
        <div className="login-icon-box">
          <Lock size={32} color="#00DE85" />
        </div>
        
        <h2 className="login-title">Acceso Restringido</h2>
        <p className="login-subtitle">Escuela Musical MPS - Dashboard de Marketing</p>
        
        <div className="login-card">
          <form onSubmit={handleSubmit}>
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  Entrar al Dashboard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
