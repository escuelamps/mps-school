"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, Utensils, Search, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CenasAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const setupRealtime = async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
        
        const q = query(collection(db, 'cenas'), orderBy('createdAt', 'desc'));
        
        // onSnapshot escucha en tiempo real
        unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setReservas(data);
          setLoading(false);
        }, (error) => {
          console.error("Error escuchando Firebase:", error);
          setLoading(false);
        });

      } catch (err) {
        console.error("Error configurando Firebase:", err);
        setLoading(false);
      }
    };

    setupRealtime();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const filtradas = reservas.filter(r => r.nombre?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem' }}>
              <ArrowLeft size={18} /> Volver al panel principal
            </Link>
            <h1 style={{ fontSize: '2rem', color: '#000F11', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Utensils color="#b91c1c" /> Gestión de Cenas
            </h1>
            <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>Supervisa las reservas en tiempo real.</p>
          </div>
          
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Total Reservas</p>
              <h2 style={{ margin: 0, color: '#000F11', fontSize: '1.8rem' }}>{reservas.length}</h2>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Menú Res</p>
              <h2 style={{ margin: 0, color: '#b91c1c', fontSize: '1.8rem' }}>{reservas.filter(r => r.opcionCena?.includes('Res')).length}</h2>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Menú Veggie</p>
              <h2 style={{ margin: 0, color: '#15803d', fontSize: '1.8rem' }}>{reservas.filter(r => r.opcionCena?.includes('Vegetariano')).length}</h2>
            </div>
          </div>
        </header>

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          
          {/* AVISO HÍBRIDO */}
          <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '1rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>🟢</span>
            <div>
              <p style={{ margin: 0, color: '#166534', fontWeight: 'bold', fontSize: '0.95rem' }}>Sistema Híbrido Activo (Tiempo Real)</p>
              <p style={{ margin: 0, color: '#15803d', fontSize: '0.85rem' }}>
                Este panel extrae los datos de Firebase al instante. Al mismo tiempo, el sistema está enviando una copia oculta a Google Sheets para la administración de la escuela.
              </p>
            </div>
          </div>

          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
              <input 
                type="text" 
                placeholder="Buscar invitado por nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>Invitado</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#64748b', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>Mesa</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>Menú Elegido</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>Estado del Pago</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#64748b', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Sincronizando con Firebase en tiempo real...
                  </td>
                </tr>
              ) : filtradas.map(reserva => (
                <tr key={reserva.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <p style={{ margin: 0, fontWeight: '500', color: '#0f172a' }}>{reserva.nombre}</p>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{reserva.mesa ? `#${reserva.mesa}` : '-'}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500',
                      background: reserva.opcionCena?.includes('Res') ? '#fee2e2' : '#dcfce7',
                      color: reserva.opcionCena?.includes('Res') ? '#b91c1c' : '#15803d'
                    }}>
                      {reserva.opcionCena}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      color: reserva.estado === 'Aprobado' ? '#15803d' : '#ca8a04',
                      fontWeight: '500', fontSize: '0.9rem'
                    }}>
                      {reserva.estado === 'Aprobado' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      {reserva.estado || 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    {reserva.comprobanteUrl ? (
                      <a href={reserva.comprobanteUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                        Ver Recibo
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sin recibo</span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filtradas.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No hay reservas aún. Haz una prueba desde /cena y la verás aparecer aquí al instante.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
