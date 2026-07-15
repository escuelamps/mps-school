"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--rich-black)', borderTop: '1px solid rgba(0,222,133,0.1)', padding: '3rem 2rem' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
        <div>
          <h3 style={{ color: 'var(--accent)', fontSize: '1.5rem', marginBottom: '1rem' }}>MPS</h3>
          <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
            Music and Production School. Formando talentos en música, producción musical, actuación y fotografía.
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Enlaces Rápidos</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.7 }}>
            <li><a href="/nosotros">Nosotros</a></li>
            <li><a href="/programas">Programas</a></li>
            <li><a href="/login">Portal de Estudiantes</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Contacto</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.7 }}>
            <li>contacto@mps.edu</li>
            <li>+1 234 567 8900</li>
          </ul>
          <a href="https://wa.me/12345678900" target="_blank" rel="noopener noreferrer" style={{ 
            position: 'fixed', bottom: '30px', right: '30px', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
            padding: '1rem', background: '#25D366', color: 'white', fontWeight: 600,
            borderRadius: '50px', textDecoration: 'none', fontSize: '0.9rem',
            boxShadow: '0 10px 20px rgba(37,211,102,0.4)', transition: 'transform 0.3s ease'
          }} onMouseOver={(e)=>e.currentTarget.style.transform='scale(1.05)'} onMouseOut={(e)=>e.currentTarget.style.transform='scale(1)'} title="Escríbenos por WhatsApp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span style={{ display: 'none' }} className="wa-text">WhatsApp</span>
          </a>
        </div>
      </div>
      <div className="container" style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
        &copy; {new Date().getFullYear()} MPS - Music and Production School. Todos los derechos reservados.
      </div>
    </footer>
  );
}
