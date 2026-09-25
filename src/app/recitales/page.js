"use client";
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, CheckCircle2, Utensils, QrCode } from 'lucide-react';

export default function RecitalesPage() {
  const [fecha, setFecha] = useState('2026-10-04');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [acompanante, setAcompanante] = useState('');
  
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const AVAILABLE_DATES = ['2026-10-04', '2026-10-18', '2026-11-01'];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    if (dateParam && AVAILABLE_DATES.includes(dateParam)) {
      setFecha(dateParam);
    } else {
      checkCapacity('2026-10-04');
    }
  }, []);

  useEffect(() => {
    checkCapacity(fecha);
  }, [fecha]);

  const checkCapacity = async (dateToCheck) => {
    setLoading(true);
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, query, where, getCountFromServer } = await import('firebase/firestore');
      const q = query(collection(db, 'recitales'), where('fecha', '==', dateToCheck));
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;
      setIsFull(count >= 7);
    } catch (err) {
      console.error("Error validando aforo:", err);
    }
    setLoading(false);
  };

  const getNextAvailable = () => {
    const currentIndex = AVAILABLE_DATES.indexOf(fecha);
    if (currentIndex >= 0 && currentIndex < AVAILABLE_DATES.length - 1) {
      return AVAILABLE_DATES[currentIndex + 1];
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !telefono) {
      setErrorMsg('Por favor llena todos los datos.');
      return;
    }
    
    setSubmitting(true);
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc, serverTimestamp, query, where, getCountFromServer } = await import('firebase/firestore');
      
      // Doble validación por seguridad
      const q = query(collection(db, 'recitales'), where('fecha', '==', fecha));
      const snapshot = await getCountFromServer(q);
      if (snapshot.data().count >= 7) {
        setErrorMsg('¡Oh no! Justo se acaban de agotar los cupos para esta fecha.');
        setIsFull(true);
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'recitales'), {
        nombre,
        telefono,
        acompanante,
        fecha,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Hubo un error al registrarte. Por favor intenta de nuevo.');
    }
    setSubmitting(false);
  };

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  if (success) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '1rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--glass-border)', maxWidth: '500px' }}>
          <CheckCircle2 size={60} color="var(--accent)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
          <h1 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>¡Cupo Reservado!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Te esperamos el {formatDate(fecha)} para disfrutar de nuestro recital.</p>
          <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ padding: '1rem 2rem', border: 'none', borderRadius: '12px', fontSize: '1.1rem', cursor: 'pointer' }}>Volver al inicio</button>
        </div>
      </main>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    outline: 'none'
  };

  return (
    <main style={{ minHeight: '100vh', padding: '100px 20px 50px 20px', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Lado Izquierdo: Registro */}
        <div className="glass-card" style={{ padding: '2.5rem', height: 'fit-content' }}>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>Recitales MPS</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Entrada gratuita. Aforo máximo de 7 personas por fecha.</p>

          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
              <Calendar size={20} color="var(--accent)" />
              <select 
                value={fecha} 
                onChange={(e) => { setFecha(e.target.value); setErrorMsg(''); }}
                style={{ ...inputStyle, padding: '0.5rem', width: 'auto', display: 'inline-block' }}
              >
                {AVAILABLE_DATES.map(d => (
                  <option key={d} value={d}>{formatDate(d)}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
              <Clock size={20} color="var(--accent)" /> 11:00 AM
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
              <MapPin size={20} color="var(--accent)" /> Sede Principal MPS
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Verificando cupos...</div>
          ) : isFull ? (
            <div style={{ background: 'rgba(255, 105, 97, 0.1)', border: '1px solid #ff6961', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <h3 style={{ color: '#ff6961', marginBottom: '1rem', fontSize: '1.2rem' }}>¡Cupos agotados!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Ya se llenaron las 7 sillas para esta fecha.</p>
              {getNextAvailable() && (
                <button 
                  onClick={() => setFecha(getNextAvailable())}
                  style={{ background: 'var(--accent)', border: 'none', padding: '1rem', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                >
                  Inscribirme al {formatDate(getNextAvailable())}
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nombre Completo</label>
                <input required value={nombre} onChange={e => { setNombre(e.target.value); setErrorMsg(''); }} style={inputStyle} placeholder="Tu nombre" />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Teléfono (WhatsApp)</label>
                <input required type="text" inputMode="numeric" value={telefono} onChange={e => { setTelefono(e.target.value); setErrorMsg(''); }} style={inputStyle} placeholder="300 000 0000" />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Acompañante (Opcional)</label>
                <input value={acompanante} onChange={e => { setAcompanante(e.target.value); setErrorMsg(''); }} style={inputStyle} placeholder="Nombre de quien te acompaña" />
              </div>

              
              
              {errorMsg && (
                <div style={{ background: 'rgba(255, 105, 97, 0.1)', color: '#ff6961', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 105, 97, 0.3)', fontSize: '0.9rem', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}
              <button  
                 type="submit" 
                disabled={submitting}
                className="btn-primary" 
                style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Reservando...' : 'Reservar mi cupo gratis'}
              </button>
            </form>
          )}
        </div>

        {/* Lado Derecho: Menú Flotante */}
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--accent)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-primary)', fontSize: '1.3rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <Utensils color="var(--accent)" /> Comida en el Recital
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              ¡Acompaña la música con algo delicioso! Estos son los productos que tendremos disponibles durante el evento:
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                <span>🍔 Hamburguesa Sola</span> <strong style={{ color: 'var(--accent)' }}>$12.000</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                <span>🍔 Combo + Gaseosa</span> <strong style={{ color: 'var(--accent)' }}>$15.000</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                <span>🍔 Combo + Cerveza</span> <strong style={{ color: 'var(--accent)' }}>$18.000</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                <span>🍺 Cerveza (Club/Águila)</span> <strong style={{ color: 'var(--accent)' }}>$5.000</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                <span>🥤 Gaseosa / Jugo</span> <strong style={{ color: 'var(--accent)' }}>$3.500</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                <span>🍟 Paquetes</span> <strong style={{ color: 'var(--accent)' }}>$3.000</strong>
              </li>
            </ul>

            <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <QrCode size={18} /> Paga fácil vía Nequi o Bre-B
              </h4>
              <div style={{ background: '#fff', padding: '10px', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
                <img src="/images/qr.png" alt="QR Nequi" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                O usa la llave Bre-B:<br/>
                <strong style={{ color: 'var(--accent)', fontSize: '1.2rem', letterSpacing: '1px' }}>@miprimersol</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
