"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ContactModal, LoginModal } from '@/components/Modals';
import { Menu, X, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const EVENTS_DB = [
  { date: '2026-08-22', title: 'Concierto de Gala MPS', type: 'upcoming', link: '/evento', time: '7:00 PM' },
  { date: '2026-07-15', title: 'Muestra de Alumnos', type: 'past', link: '/eventos-anteriores', time: '5:00 PM' },
  { date: '2026-09-30', title: 'Recital de Otoño', type: 'upcoming', link: '/evento', time: '6:30 PM' },
];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function EventModal({ isOpen, onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (!isOpen) return null;

  const minDate = new Date(2026, 6, 1);
  const maxDate = new Date(2030, 11, 1);

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      return newDate >= minDate ? newDate : prev;
    });
    setSelectedEvent(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      return newDate <= maxDate ? newDate : prev;
    });
    setSelectedEvent(null);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const getEventForDate = (dateObj) => {
    if (!dateObj) return null;
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    return EVENTS_DB.find(e => e.date === dateStr);
  };

  const isPrevDisabled = currentDate.getFullYear() === minDate.getFullYear() && currentDate.getMonth() === minDate.getMonth();
  const isNextDisabled = currentDate.getFullYear() === maxDate.getFullYear() && currentDate.getMonth() === maxDate.getMonth();

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 15, 17, 0.8)', backdropFilter: 'blur(10px)' }} />
      <div className="glass-card" style={{ position: 'relative', width: '100%', maxWidth: '450px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px' }}>
          <X size={24} />
        </button>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={24} color="var(--accent)" /> Calendario MPS
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--panel-bg)', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <button onClick={handlePrevMonth} disabled={isPrevDisabled} style={{ background: 'none', border: 'none', color: isPrevDisabled ? 'var(--glass-border)' : 'var(--text-primary)', cursor: isPrevDisabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={24} />
          </button>
          <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={handleNextMonth} disabled={isNextDisabled} style={{ background: 'none', border: 'none', color: isNextDisabled ? 'var(--glass-border)' : 'var(--text-primary)', cursor: isNextDisabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={24} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginBottom: '1.5rem' }}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
            <div key={day} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold', paddingBottom: '0.5rem' }}>
              {day}
            </div>
          ))}
          
          {days.map((dateObj, i) => {
            const ev = getEventForDate(dateObj);
            const isSelected = selectedEvent && dateObj && getEventForDate(dateObj)?.date === selectedEvent.date;
            
            return (
              <div 
                key={i} 
                onClick={() => ev && setSelectedEvent(ev)}
                style={{ 
                  aspectRatio: '1', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '8px', 
                  background: dateObj ? (isSelected ? 'rgba(0,222,133,0.2)' : 'var(--panel-bg)') : 'transparent',
                  border: `1px solid ${isSelected ? 'var(--accent)' : (dateObj ? 'var(--glass-border)' : 'transparent')}`,
                  color: dateObj ? 'var(--text-primary)' : 'transparent',
                  cursor: ev ? 'pointer' : 'default',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                {dateObj?.getDate()}
                {ev && (
                  <div style={{ 
                    width: '6px', height: '6px', borderRadius: '50%', 
                    background: ev.type === 'upcoming' ? 'var(--accent)' : '#888',
                    marginTop: '2px'
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {selectedEvent ? (
          <div style={{ background: selectedEvent.type === 'upcoming' ? 'rgba(0,222,133,0.05)' : 'var(--panel-bg)', border: `1px solid ${selectedEvent.type === 'upcoming' ? 'var(--accent)' : 'var(--glass-border)'}`, padding: '1.5rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: selectedEvent.type === 'upcoming' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {selectedEvent.type === 'upcoming' ? 'Próximo Evento' : 'Evento Pasado'}
            </span>
            <h4 style={{ margin: '0.5rem 0', color: 'var(--text-primary)', fontSize: '1.2rem' }}>{selectedEvent.title}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <Clock size={16} /> {selectedEvent.time}
            </div>
            <Link href={selectedEvent.link} onClick={onClose} style={{ display: 'block', textAlign: 'center', background: selectedEvent.type === 'upcoming' ? 'var(--accent)' : 'var(--section-bg)', color: selectedEvent.type === 'upcoming' ? '#000' : 'var(--text-primary)', textDecoration: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', border: selectedEvent.type === 'upcoming' ? 'none' : '1px solid var(--glass-border)' }}>
              {selectedEvent.type === 'upcoming' ? 'Reservar Boleta' : 'Ver Galería'}
            </Link>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
            Selecciona un día con punto para ver los detalles del evento.
          </div>
        )}
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
          <Link href="/quienes-somos" className="nav-link">Quiénes Somos</Link>
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
          <Link href="/quienes-somos" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 500 }}>Quiénes Somos</Link>
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
