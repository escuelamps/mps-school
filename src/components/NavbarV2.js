import Link from 'next/link';
import { PhoneCall } from 'lucide-react';

export default function NavbarV2() {
  return (
    <nav style={{
      width: '100%',
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(0, 15, 17, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/v2" style={{ textDecoration: 'none' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            <span style={{ color: 'var(--text-primary)' }}>MPS</span>
            <span style={{ color: 'var(--accent)' }}>.</span>
          </h2>
        </Link>
      </div>

      <div>
        <Link href="#contacto" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PhoneCall size={16} /> Contáctanos
        </Link>
      </div>
    </nav>
  );
}
