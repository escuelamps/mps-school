import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

export default function EventosAnterioresPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <Link href="/" style={{ position: 'absolute', top: '2rem', left: '2rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <ArrowLeft size={20} /> Volver
      </Link>

      <div className="glass-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '4rem 2rem' }}>
        
        <div style={{ width: '100px', height: '100px', background: 'rgba(0, 222, 133, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
          <Construction size={50} color="var(--accent)" />
        </div>
        
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>
          Galería en Construcción
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
          Estamos preparando este espacio para compartir los mejores momentos, fotos y recuerdos de nuestros eventos pasados. ¡Vuelve pronto!
        </p>
        
        <Link href="/" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Regresar al Inicio
        </Link>
        
      </div>
    </main>
  );
}
