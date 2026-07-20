"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ContactModal } from '@/components/Modals';
import { Menu, X } from 'lucide-react';

export default function HeaderV3() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          {[...Array(6)].map((_, i) => (
            <div key={i} className="marquee-item">
              <span>INICIACIÓN MUSICAL</span>
              <span>•</span>
              <span>PRODUCCIÓN</span>
              <span>•</span>
              <span>ACTUACIÓN</span>
              <span>•</span>
            </div>
          ))}
        </div>
      </div>

      {/* HEADER ACADÉMICO */}
      <nav style={{
        padding: '1.5rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,15,17,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/images/logo2.png" alt="MPS Escuela Logo" style={{ height: '75px', objectFit: 'contain' }} />
        </Link>
        <div className="desktop-nav" style={{ gap: '2rem', alignItems: 'center' }}>
          <Link href="/#programas" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: '0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='white'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-secondary)'}>Programas</Link>
          <Link href="/#metodologia" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: '0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='white'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-secondary)'}>Metodología</Link>
          <Link href="/#docentes" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: '0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='white'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-secondary)'}>Docentes</Link>
          <Link href="/#ubicacion" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: '0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='white'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-secondary)'}>Ubicación</Link>
          <Link href="/login" className="btn-primary" style={{ padding: '0.6rem 1.5rem', textDecoration: 'none' }}>
            Portal / Login
          </Link>
        </div>
        <div className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
        
        {/* Menú Móvil Desplegable */}
        <div className="mobile-menu" style={{ display: isMobileMenuOpen ? 'flex' : 'none' }}>
          <Link href="/#programas" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 500 }}>Programas</Link>
          <Link href="/#metodologia" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 500 }}>Metodología</Link>
          <Link href="/#docentes" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 500 }}>Docentes</Link>
          <Link href="/#ubicacion" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 500 }}>Ubicación</Link>
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary" style={{ padding: '0.8rem', textAlign: 'center', marginTop: '1rem', textDecoration: 'none' }}>
            Portal / Login
          </Link>
        </div>
      </nav>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
