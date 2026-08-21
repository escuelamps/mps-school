'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Calendar, CheckCircle, XCircle, AlertTriangle, Eye, MessageSquare } from 'lucide-react';
import '../admin.css';

export default function ReservasDashboard() {
  const router = useRouter();
  const [pagos, setPagos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const qPagos = query(collection(db, 'pagos_pendientes'), orderBy('createdAt', 'desc'));
    const unsubPagos = onSnapshot(qPagos, (snapshot) => {
      setPagos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qReservas = query(collection(db, 'reservas'), orderBy('createdAt', 'desc'));
    const unsubReservas = onSnapshot(qReservas, (snapshot) => {
      setReservas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubPagos();
      unsubReservas();
    };
  }, []);

  const handleApprovePayment = async (pagoId) => {
    try {
      await updateDoc(doc(db, 'pagos_pendientes', pagoId), {
        status: 'APPROVED_MANUALLY'
      });
      alert('Pago aprobado. (La integración con Google Calendar se haría aquí en producción)');
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

  return (
    <div className="dash-container">
      {/* Sidebar - Pagos Pendientes */}
      <div className="dash-sidebar" style={{ width: '40%' }}>
        <div className="dash-header">
          <h2 className="dash-title">Buzón de Comprobantes</h2>
          <span className="live-badge">
            <span className="pulse-dot"></span> IA Activa
          </span>
        </div>
        
        <div className="chat-list" style={{ padding: '1rem' }}>
          {pagos.map(pago => (
            <div key={pago.id} className="chat-item" style={{ borderLeft: pago.status === 'REQUIRES_MANUAL_REVIEW' ? '4px solid #ef4444' : '4px solid #00DE85' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong>Transferencia: ${pago.monto || 'Desconocido'}</strong>
                {pago.status === 'REQUIRES_MANUAL_REVIEW' && <AlertTriangle size={16} color="#ef4444" />}
                {pago.status === 'APPROVED_BY_AI' && <CheckCircle size={16} color="#00DE85" />}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Referencia: {pago.referencia || 'N/A'}</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Estado: {pago.status}</p>
              
              {pago.status === 'REQUIRES_MANUAL_REVIEW' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleApprovePayment(pago.id)} style={{ padding: '0.5rem', background: '#00DE85', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Aprobar</button>
                  <button onClick={() => handleRejectPayment(pago.id)} style={{ padding: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Rechazar</button>
                </div>
              )}
            </div>
          ))}
          {pagos.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>No hay comprobantes recientes.</p>}
        </div>
      </div>

      {/* Main Content - Calendario Master */}
      <div className="dash-main" style={{ padding: '2rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit', color: '#000F11', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Calendar /> Calendario Maestro de Reservas
          </h1>
          <button 
            onClick={() => router.push('/admin/chats')}
            style={{ padding: '0.5rem 1rem', background: '#000F11', color: '#00DE85', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
          >
            <MessageSquare size={18} /> Ir a Chats
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '1rem' }}>
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
