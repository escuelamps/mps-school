"use client";
import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import FooterV3 from '@/components/FooterV3';
import HeaderV3 from '@/components/HeaderV3';
import { DOCENTES_OFICIALES, CATEDRAS_OFICIALES } from '@/data/team';

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid var(--glass-border)', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', transition: 'all 0.3s ease' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', padding: '1.5rem', 
          background: isOpen ? 'rgba(0,222,133,0.1)' : 'var(--panel-bg)', 
          color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', cursor: 'pointer', border: 'none', 
          fontSize: '1.2rem', fontWeight: 600, transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => { if(!isOpen) e.currentTarget.style.background = 'var(--glass-border)' }}
        onMouseOut={(e) => { if(!isOpen) e.currentTarget.style.background = 'var(--panel-bg)' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
          {title}
        </span>
        <span style={{ fontSize: '1.5rem', color: 'var(--accent)', fontWeight: 300 }}>{isOpen ? '−' : '+'}</span>
      </button>
      <div style={{ 
        maxHeight: isOpen ? '3000px' : '0', 
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.4s ease-in-out'
      }}>
        <div style={{ padding: '2rem 1.5rem', background: 'var(--accordion-bg)', color: 'var(--text-secondary)', borderTop: '1px solid var(--glass-border)', lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default function QuienesSomosPage() {
  const [selectedDocente, setSelectedDocente] = useState(null);

  const docentes = DOCENTES_OFICIALES;
  const catedras = CATEDRAS_OFICIALES;

  const getDocentesPorCatedra = (nombres) => {
    return nombres.map(n => docentes.find(d => d.nombre === n)).filter(Boolean);
  };

  const DocenteGrid = ({ listaDocentes }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
      {listaDocentes.map((docente, i) => (
        <div key={i} style={{ 
          background: 'var(--panel-bg)', 
          borderRadius: '20px', 
          overflow: 'hidden', 
          border: '1px solid var(--glass-border)', 
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }} 
        onClick={() => setSelectedDocente(docente)}
        onMouseOver={(e)=>{
          e.currentTarget.style.transform='translateY(-5px)';
          e.currentTarget.style.boxShadow='0 12px 24px rgba(0,222,133,0.15)';
        }} 
        onMouseOut={(e)=>{
          e.currentTarget.style.transform='translateY(0)';
          e.currentTarget.style.boxShadow='0 4px 15px rgba(0,0,0,0.05)';
        }}>
          <div style={{ position: 'relative', height: '250px' }}>
            <img src={docente.img} alt={docente.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: docente.imgPos || 'top center' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
              <span style={{ background: 'var(--accent)', color: '#000F11', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>
                {docente.especialidad}
              </span>
            </div>
          </div>
          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>{docente.nombre}</h3>
            <h4 style={{ color: 'var(--accent)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>{docente.rol}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>{docente.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', paddingBottom: '4rem' }}>
      <HeaderV3 />

      {/* HERO QUIÉNES SOMOS */}
      <section style={{ padding: '6rem 5% 4rem 5%', textAlign: 'center', background: 'radial-gradient(circle at 50% 0%, rgba(0,222,133,0.1) 0%, transparent 60%)' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Quiénes <span className="text-gradient">Somos</span></h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', lineHeight: 1.8 }}>
          En Music and Production School (MPS) somos una familia apasionada por el arte. 
          Nos dedicamos a formar artistas integrales, combinando la teoría con la práctica constante en escenarios y estudios reales. 
          Creemos que la mejor forma de aprender es viviéndolo desde el primer día.
        </p>
      </section>

      {/* CÁTEDRAS ACORDEÓN */}
      <section style={{ padding: '2rem 5%', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '3rem' }}>Nuestras <span className="text-gradient">Cátedras</span> y Docentes</h2>
        
        {catedras.map((catedra, index) => (
          <AccordionItem key={index} title={catedra.titulo} defaultOpen={index === 0}>
            <DocenteGrid listaDocentes={getDocentesPorCatedra(catedra.nombresDocentes)} />
          </AccordionItem>
        ))}
      </section>

      {/* SLIDE-OVER SIDEBAR PARA DETALLE DE DOCENTE */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
        zIndex: 100,
        opacity: selectedDocente ? 1 : 0,
        pointerEvents: selectedDocente ? 'auto' : 'none',
        transition: 'opacity 0.3s ease'
      }} onClick={() => setSelectedDocente(null)}>
        
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: '450px',
          background: 'var(--bg-secondary)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          transform: selectedDocente ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto'
        }} onClick={(e) => e.stopPropagation()}>
          
          {selectedDocente && (
            <>
              <button 
                onClick={() => setSelectedDocente(null)}
                style={{
                  position: 'absolute', top: '1.5rem', right: '1.5rem',
                  background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                  width: '40px', height: '40px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 10
                }}
              >
                <X size={20} />
              </button>

              <div style={{ position: 'relative', height: '350px' }}>
                <img src={selectedDocente.img} alt={selectedDocente.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: selectedDocente.imgPos || 'top center' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(transparent, var(--bg-secondary))' }}></div>
              </div>

              <div style={{ padding: '0 2.5rem 3rem 2.5rem', marginTop: '-2rem', position: 'relative', zIndex: 5 }}>
                <span style={{ display: 'inline-block', background: 'var(--accent)', color: 'black', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  {selectedDocente.especialidad}
                </span>
                
                <h2 style={{ fontSize: '2rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>{selectedDocente.nombre}</h2>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '2rem' }}>{selectedDocente.rol}</h3>
                
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Perfil Profesional</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                  {selectedDocente.bio}
                </p>

                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Resumen</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
                  {selectedDocente.desc}
                </p>
                
                <button 
                  style={{ width: '100%', marginTop: '3rem', padding: '1rem', borderRadius: '50px', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseOver={(e)=>{e.currentTarget.style.background='var(--accent)'; e.currentTarget.style.color='black'}}
                  onMouseOut={(e)=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--accent)'}}
                  onClick={() => window.location.href='/#programas'}
                >
                  Ver Programas Relacionados
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <FooterV3 />
    </div>
  );
}
