'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  MessageSquare,
  Tag,
  Plus,
  Trash2,
  Ticket
} from 'lucide-react';
import '../admin.css';

export default function ReservasDashboard() {
  const router = useRouter();
  const [pagos, setPagos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cupones, setCupones] = useState([]);
  
  // Estado para crear nuevo cupón
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoValor, setNuevoValor] = useState('30000');
  const [creandoCupon, setCreandoCupon] = useState(false);
  const [mensajeCupon, setMensajeCupon] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (!data.username || (data.role !== 'admin' && data.cargo !== 'direccion' && data.cargo !== 'administracion' && data.cargo !== 'recepcion')) {
            router.replace('/admin');
          }
        })
        .catch(() => router.replace('/admin'));
    };

    checkAuth();

    // Soporte BFCache para que al dar "Atrás" se revalide la sesión
    const handlePageShow = (event) => {
      if (event.persisted) {
        checkAuth();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    const qPagos = query(collection(db, 'pagos_pendientes'), orderBy('createdAt', 'desc'));
    const unsubPagos = onSnapshot(qPagos, (snapshot) => {
      setPagos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qReservas = query(collection(db, 'reservas'), orderBy('createdAt', 'desc'));
    const unsubReservas = onSnapshot(qReservas, (snapshot) => {
      setReservas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qCupones = query(collection(db, 'cupones_descuento'), orderBy('createdAt', 'desc'));
    const unsubCupones = onSnapshot(qCupones, (snapshot) => {
      setCupones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      unsubPagos();
      unsubReservas();
      unsubCupones();
    };
  }, [router]);

  const handleApprovePayment = async (pagoId) => {
    try {
      await updateDoc(doc(db, 'pagos_pendientes', pagoId), {
        status: 'APPROVED_MANUALLY'
      });
      alert('Pago aprobado exitosamente.');
    } catch (error) {
      console.error(error);
      alert('Error aprobando el pago');
    }
  };

  const handleRejectPayment = async (pagoId) => {
    try {
      await updateDoc(doc(db, 'pagos_pendientes', pagoId), {
        status: 'REJECTED'
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Generador aleatorio de código MPS
  const handleGenerarCodigoAleatorio = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'MPS-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNuevoCodigo(code);
  };

  // Crear cupón con caducidad exacta de 30 días
  const handleCrearCupon = async (e) => {
    e.preventDefault();
    if (!nuevoCodigo.trim()) {
      alert('Por favor escribe o genera un código');
      return;
    }

    setCreandoCupon(true);
    setMensajeCupon('');

    try {
      const codeClean = nuevoCodigo.trim().toUpperCase().replace(/\s+/g, '');
      const ahora = new Date();
      // Caducidad de 30 días calculada internamente
      const expira = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

      await addDoc(collection(db, 'cupones_descuento'), {
        codigo: codeClean,
        tipo: 'monto',
        valor: Number(nuevoValor) || 30000,
        origen: 'admin_reservas',
        creadoPor: 'lpineda',
        estado: 'ACTIVO',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expira),
        usosPermitidos: 1,
        usosActuales: 0
      });

      setMensajeCupon(`Código ${codeClean} creado exitosamente.`);
      setNuevoCodigo('');
      setNuevoValor('30000');
      setTimeout(() => setMensajeCupon(''), 4000);
    } catch (err) {
      console.error('Error creando cupón:', err);
      alert('Error creando el código de descuento');
    } finally {
      setCreandoCupon(false);
    }
  };

  // Eliminar cupón
  const handleEliminarCupon = async (cuponId) => {
    if (confirm('¿Deseas eliminar este código de descuento?')) {
      try {
        await deleteDoc(doc(db, 'cupones_descuento', cuponId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Evaluar estado de vigencia de 30 días
  const getCuponStatus = (cupon) => {
    if (cupon.estado === 'USADO') return { text: 'Usado', color: '#64748b', bg: '#f1f5f9' };
    if (cupon.expiresAt) {
      const expDate = cupon.expiresAt.toDate ? cupon.expiresAt.toDate() : new Date(cupon.expiresAt);
      if (new Date() > expDate) {
        return { text: 'Vencido', color: '#ef4444', bg: '#fee2e2' };
      }
    }
    return { text: 'Activo', color: '#09624C', bg: '#dcfce7' };
  };

  return (
    <div className="dash-container">
      {/* Sidebar - Pagos Pendientes */}
      <div className="dash-sidebar" style={{ width: '40%' }}>
        <div className="dash-header">
          <h2 className="dash-title">Buzón de Comprobantes</h2>
          <span className="live-badge">
            <span className="pulse-dot"></span> Sistema Activo
          </span>
        </div>
        
        <div className="chat-list" style={{ padding: '1rem' }}>
          {pagos.map(pago => (
            <div key={pago.id} className="chat-item" style={{ borderLeft: (pago.status === 'REQUIRES_MANUAL_REVIEW' || pago.estado === 'PENDIENTE_VERIFICACION') ? '4px solid #f59e0b' : '4px solid #00DE85' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong>
                  {pago.producto?.titulo || `Transferencia: $${pago.monto || pago.producto?.totalCOP || 'N/A'}`}
                </strong>
                {(pago.status === 'REQUIRES_MANUAL_REVIEW' || pago.estado === 'PENDIENTE_VERIFICACION') && <AlertTriangle size={16} color="#f59e0b" />}
                {(pago.status === 'APPROVED_BY_AI' || pago.status === 'APPROVED_MANUALLY' || pago.estado === 'APROBADO_MERCADOPAGO') && <CheckCircle size={16} color="#00DE85" />}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Cliente: {pago.cliente?.nombre || pago.studentName || 'N/A'} {pago.cliente?.telefono ? `(${pago.cliente.telefono})` : ''}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Total: ${pago.producto?.totalCOP?.toLocaleString() || pago.monto || '0'} COP • Estado: {pago.estado || pago.status}
              </p>
              
              {(pago.status === 'REQUIRES_MANUAL_REVIEW' || pago.estado === 'PENDIENTE_VERIFICACION') && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleApprovePayment(pago.id)} style={{ padding: '0.5rem', background: '#00DE85', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}>Aprobar</button>
                  <button onClick={() => handleRejectPayment(pago.id)} style={{ padding: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Rechazar</button>
                </div>
              )}
            </div>
          ))}
          {pagos.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>No hay comprobantes recientes.</p>}
        </div>
      </div>

      {/* Main Content - Gestión de Cupones y Calendario */}
      <div className="dash-main" style={{ padding: '2rem', overflowY: 'auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit', color: '#000F11', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Calendar /> Calendario Maestro & Cupones
          </h1>
          <button 
            onClick={() => router.push('/admin/chats')}
            style={{ padding: '0.5rem 1rem', background: '#000F11', color: '#00DE85', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
          >
            <MessageSquare size={18} /> Ir a Chats
          </button>
        </div>

        {/* SECCIÓN GESTIÓN DE CÓDIGOS DE DESCUENTO PARA LPINEDA */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
            <Ticket size={22} color="#09624C" />
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#000F11' }}>Generador de Códigos de Descuento</h2>
          </div>

          <form onSubmit={handleCrearCupon} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                Código
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input 
                  type="text"
                  placeholder="Ej: MPS-DESCUENTO"
                  value={nuevoCodigo}
                  onChange={(e) => setNuevoCodigo(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}
                />
                <button
                  type="button"
                  onClick={handleGenerarCodigoAleatorio}
                  style={{ padding: '0.6rem 0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Aleatorio
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                Valor Descuento (COP)
              </label>
              <select
                value={nuevoValor}
                onChange={(e) => setNuevoValor(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
              >
                <option value="20000">$20.000 COP</option>
                <option value="30000">$30.000 COP</option>
                <option value="40000">$40.000 COP</option>
                <option value="50000">$50.000 COP</option>
                <option value="70000">$70.000 COP</option>
                <option value="100000">$100.000 COP</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creandoCupon}
              style={{ padding: '0.65rem 1.2rem', background: '#09624C', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Plus size={16} /> {creandoCupon ? 'Creando...' : 'Crear Código'}
            </button>
          </form>

          {mensajeCupon && (
            <div style={{ padding: '0.6rem 1rem', background: '#dcfce7', color: '#09624C', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
              {mensajeCupon}
            </div>
          )}

          {/* TABLA DE CUPONES ACTIVOS */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '0.7rem' }}>Código</th>
                <th style={{ padding: '0.7rem' }}>Descuento</th>
                <th style={{ padding: '0.7rem' }}>Origen</th>
                <th style={{ padding: '0.7rem' }}>Estado</th>
                <th style={{ padding: '0.7rem', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cupones.map(cupon => {
                const status = getCuponStatus(cupon);
                return (
                  <tr key={cupon.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.7rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                      {cupon.codigo}
                    </td>
                    <td style={{ padding: '0.7rem', color: '#09624C', fontWeight: 700 }}>
                      ${Number(cupon.valor).toLocaleString()} COP
                    </td>
                    <td style={{ padding: '0.7rem', color: '#64748b' }}>
                      {cupon.origen === 'juego_app' ? '🎮 Juego App' : '👤 Dirección General'}
                    </td>
                    <td style={{ padding: '0.7rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: status.color, background: status.bg }}>
                        {status.text}
                      </span>
                    </td>
                    <td style={{ padding: '0.7rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEliminarCupon(cupon.id)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}
                        title="Eliminar código"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {cupones.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                    No hay códigos de descuento registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLA DE RESERVAS */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#000F11', fontSize: '1.15rem' }}>Clases Programadas</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: '#64748b' }}>Fecha</th>
                <th style={{ padding: '1rem', color: '#64748b' }}>Estudiante</th>
                <th style={{ padding: '1rem', color: '#64748b' }}>Clase / Profesor</th>
                <th style={{ padding: '1rem', color: '#64748b' }}>Estado</th>
                <th style={{ padding: '1rem', color: '#64748b' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map(reserva => (
                <tr key={reserva.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>{new Date(reserva.start).toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <strong>{reserva.studentName}</strong><br/>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{reserva.studentEmail}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>{reserva.classType} - {reserva.teacherName}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', background: '#dcf8c6', color: '#09624C', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {reserva.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      Cancelar Clase
                    </button>
                  </td>
                </tr>
              ))}
              {reservas.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No hay clases agendadas aún.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
