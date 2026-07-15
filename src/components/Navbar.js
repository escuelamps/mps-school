"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LoginModal, ContactModal } from './Modals';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <nav className="glass" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, padding: '1rem 2rem' }}>
        <div className="flex-between container">
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent)', fontSize: '2rem', fontStyle: 'italic' }}>M</span>
            <span>MPS</span>
          </Link>

          {/* Desktop Menu */}
          <div style={{ display: 'none', gap: '2rem', alignItems: 'center' }} className="desktop-menu">
            <Link href="/nosotros" style={{ fontWeight: 500, transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent)'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Nosotros</Link>
            <Link href="/programas" style={{ fontWeight: 500, transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent)'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Programas</Link>
            <button onClick={() => setIsContactOpen(true)} style={{ fontWeight: 500, transition: 'color 0.3s', color: 'var(--text-primary)', fontSize: '1rem' }} onMouseOver={(e) => e.target.style.color = 'var(--accent)'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Contacto</button>
            <button onClick={() => setIsLoginOpen(true)} className="btn-secondary" style={{ padding: '0.5rem 1.5rem' }}>Login</button>
          </div>

          {/* Mobile Toggle */}
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} style={{ display: 'block', color: 'var(--text-primary)' }}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', padding: '1rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(0,222,133,0.1)' }}>
            <Link href="/nosotros" onClick={() => setIsOpen(false)}>Nosotros</Link>
            <Link href="/programas" onClick={() => setIsOpen(false)}>Programas</Link>
            <button onClick={() => { setIsContactOpen(true); setIsOpen(false); }} style={{ textAlign: 'left', color: 'inherit', fontSize: '1rem' }}>Contacto</button>
            <button onClick={() => { setIsLoginOpen(true); setIsOpen(false); }} className="btn-secondary" style={{ textAlign: 'center', width: '100%' }}>Login</button>
          </div>
        )}

        <style jsx>{`
          @media (min-width: 768px) {
            .desktop-menu {
              display: flex !important;
            }
            .mobile-toggle {
              display: none !important;
            }
          }
        `}</style>
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
