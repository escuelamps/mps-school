'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Al cargar la página, revisamos si ya existe el consentimiento en el almacenamiento local
    const consent = localStorage.getItem('mps_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    // Guardamos la decisión del usuario para no volver a mostrar el banner
    localStorage.setItem('mps_cookie_consent', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      color: '#fff',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 9999,
      boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ fontSize: '0.85rem', maxWidth: '80%' }}>
        <p style={{ margin: 0 }}>
          <strong>Aviso de Privacidad y Cookies:</strong> Utilizamos cookies para mejorar tu experiencia en nuestra plataforma, mantener tus sesiones activas y analizar el tráfico. Al continuar navegando, aceptas nuestra política de cookies.
        </p>
      </div>
      <button 
        onClick={handleAccept}
        style={{
          backgroundColor: '#00DE85',
          color: '#111',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        Aceptar
      </button>
    </div>
  );
}
