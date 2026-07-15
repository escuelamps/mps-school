"use client";
import { useState } from 'react';
import HeaderV3 from '@/components/HeaderV3';
import FooterV3 from '@/components/FooterV3';
import { ContactModal } from '@/components/Modals';

export default function ProduccionPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--rich-black)' }}>
      <HeaderV3 />

      <section style={{ position: 'relative', height: '60vh', minHeight: '400px', display: 'flex', alignItems: 'center', padding: '0 5%' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80" alt="Producción" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to right, rgba(0,15,17,1) 0%, rgba(0,15,17,0.8) 50%, transparent 100%)' }}></div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(0,222,133,0.1)', border: '1px solid var(--accent)', borderRadius: '50px', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>
            Programa Especializado
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem', color: 'white' }}>
            Producción Musical & DJ
          </h1>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 400, marginBottom: '2rem' }}>
            Síntesis, Mezcla, Masterización y DJing
          </h3>
          <button onClick={() => setIsContactOpen(true)} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Inscribirme Ahora
          </button>
        </div>
      </section>

      <section style={{ padding: '5rem 5%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Sobre el <span className="text-gradient">Programa</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8 }}>
            Aprende a crear, mezclar y masterizar música desde cero. Utilizando software estándar de la industria como Ableton Live, Logic Pro y FL Studio. Desarrolla tu propio sonido y prepárate para la industria musical moderna.
          </p>
        </div>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>¿Qué <span className="text-gradient">incluye?</span></h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              "Salas equipadas con monitores de estudio",
              "Licencias de Ableton Live incluidas",
              "Prácticas reales en mezcla",
              "Equipos Pioneer para DJing"
            ].map((feature, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FooterV3 />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
