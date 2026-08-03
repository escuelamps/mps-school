"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ContactModal, LoginModal } from '@/components/Modals';
import { Menu, X } from 'lucide-react';

export function EventModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 15, 17, 0.8)', backdropFilter: 'blur(10px)' }} />
      <div className="glass-card" style={{ position: 'relative', width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Cartelera de Eventos</h3>
        
        <Link href="/evento" onClick={onClose} style={{ textDecoration: 'none', display: 'block', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(0,222,133,0.1)', border: '1px solid var(--accent)', padding: '1.5rem', borderRadius: '12px', transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', background: 'var(--accent)', color: '#000', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>PRÓXIMO EVENTO</div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Noches MPS (Open Mic)</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Cupos limitados. Haz clic para inscribirte como asistente o músico.</p>
          </div>
        </Link>

        <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>EVENTOS ANTERIORES</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent)' }}>•</span> Recital de Mitad de Año (Julio)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent)' }}>•</span> Taller de Producción (Junio)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent)' }}>•</span> Noche Acústica MPS (Mayo)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function HeaderV3() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);



  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-container {
          overflow: hidden;
          background: var(--accent);
          color: #000;
          padding: 10px 0;
          white-space: nowrap;
          display: flex;
          align-items: center;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-size: 0.9rem;
        }
        .marquee-content {
          display: inline-flex;
          animation: marquee 25s linear infinite;
        }
        .marquee-item {
          padding: 0 30px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
      `}} />

      {/* MARQUEE */}
      <div className="marquee-container">
        <div className="marquee-content">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="marquee-item">
              <span>FORMACIÓN MUSICAL</span>
              <span>•</span>
              <span>PRODUCCIÓN</span>
              <span>•</span>
              <span>EXPRESIÓN CORPORAL</span>
              <span>•</span>
              <span>FORMACIÓN ACTORAL</span>
              <span>•</span>
              <span>EVENTOS</span>
              <span>•</span>
              <span>FOTOGRAFÍA</span>
              <span>•</span>
              <span>SALA DE ENSAYOS</span>
              <span>•</span>
            </div>
          ))}
        </div>
      </div>

      {/* HEADER ACADÉMICO */}
      <nav className="main-nav" style={{
        padding: '1.5rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--glass-border)', background: 'var(--nav-bg)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/images/logo2.png" alt="MPS Escuela Logo" style={{ height: '75px', objectFit: 'contain' }} className="nav-logo" />
        </Link>
        <div className="desktop-nav" style={{ gap: '2rem', alignItems: 'center' }}>
          <Link href="/#programas" className="nav-link">Programas</Link>
          <Link href="/#quienes-somos" className="nav-link">Quiénes Somos</Link>
          <Link href="/#ubicacion" className="nav-link">Ubicación</Link>
          <button onClick={() => setIsEventModalOpen(true)} className="nav-link" style={{ color: 'var(--accent)', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: '1rem', cursor: 'pointer' }}>Eventos</button>
          <button onClick={() => setIsLoginOpen(true)} className="btn-primary" style={{ padding: '0.6rem 1.5rem', textDecoration: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
            Iniciar Sesión
          </button>
        </div>
        <div className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
        
        {/* Menú Móvil Desplegable */}
        <div className="mobile-menu" style={{ display: isMobileMenuOpen ? 'flex' : 'none' }}>
          <Link href="/#programas" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 500 }}>Programas</Link>
          <Link href="/#quienes-somos" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 500 }}>Quiénes Somos</Link>
          <Link href="/#ubicacion" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 500 }}>Ubicación</Link>
          <button onClick={() => {setIsMobileMenuOpen(false); setIsEventModalOpen(true);}} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: '1.2rem', fontWeight: 500, cursor: 'pointer', padding: 0 }}>Eventos</button>
          <button onClick={() => {setIsMobileMenuOpen(false); setIsLoginOpen(true);}} className="btn-primary" style={{ padding: '0.8rem', textAlign: 'center', marginTop: '1rem', textDecoration: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1.1rem' }}>
            Iniciar Sesión
          </button>
        </div>
      </nav>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <EventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} />
    </>
  );
}
