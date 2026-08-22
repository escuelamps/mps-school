"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, Utensils, Search, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CenasAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidoACerrar, setPedidoACerrar] = useState(null);

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

  const confirmarCierre = async () => {
    if (pedidoACerrar) {
      try {
        const { db } = await import('@/lib/firebase');
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'cenas', pedidoACerrar), {
          cerrado: true
        });
        setPedidoACerrar(null);
      } catch (err) {
        console.error("Error al cerrar el pedido:", err);
        alert("Error al cerrar el pedido.");
        setPedidoACerrar(null);
      }
    }
  };

  const activas = reservas.filter(r => !r.cerrado);
  const filtradas = activas.filter(r => r.nombre?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: 'clamp(1rem, 5vw, 2rem)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ flex: '1 1 300px' }}>
            <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}>
              <ArrowLeft size={18} /> Volver al panel principal
            </Link>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Utensils color="var(--accent)" /> Gestión de Pedidos
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Supervisa los pedidos de las mesas en tiempo real.</p>
          </div>
          
          <div style={{ background: 'var(--panel-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', gap: '2rem', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Pedidos</p>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.8rem' }}>{activas.length}</h2>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pagos Pendientes</p>
              <h2 style={{ margin: 0, color: '#ca8a04', fontSize: '1.8rem' }}>{activas.filter(r => r.estado !== 'Aprobado' && r.estado !== 'Pagado').length}</h2>
            </div>
          </div>
        </header>

        <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>

          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
              <input 
                type="text" 
                placeholder="Buscar invitado por nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead style={{ background: 'var(--section-bg)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Invitado</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Mesa</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Pedido</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Estado del Pago</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Cargando pedidos...
                  </td>
                </tr>
              ) : filtradas.map(reserva => (
                <tr key={reserva.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)' }}>{reserva.nombre}</p>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{reserva.mesa ? `#${reserva.mesa}` : '-'}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500',
                      background: 'var(--section-bg)',
                      color: 'var(--text-primary)'
                    }}>
                      {reserva.opcionCena}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      color: (reserva.estado === 'Aprobado' || reserva.estado === 'Pagado') ? 'var(--accent)' : '#ca8a04',
                      fontWeight: '500', fontSize: '0.9rem'
                    }}>
                      {(reserva.estado === 'Aprobado' || reserva.estado === 'Pagado') ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      {reserva.estado || 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    {reserva.comprobanteUrl ? (
                      <a href={reserva.comprobanteUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', padding: '0.5rem 1rem', background: 'var(--section-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                        Ver Recibo
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sin recibo</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500', background: 'var(--section-bg)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                      <input 
                        type="checkbox" 
                        checked={false} 
                        onChange={() => setPedidoACerrar(reserva.id)} 
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                      />
                      Entregado / Cancelado
                    </label>
                  </td>
                </tr>
              ))}
              {!loading && filtradas.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay pedidos registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      {pedidoACerrar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(0, 222, 133, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={30} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>¿Confirmar Acción?</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              ¿El pedido fue entregado y cancelado?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setPedidoACerrar(null)} 
                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                No, aún no
              </button>
              <button 
                onClick={confirmarCierre} 
                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: 'var(--bg-primary)', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Sí, confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
