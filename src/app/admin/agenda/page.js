'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Calendar, Plus, Trash2, ArrowLeft } from 'lucide-react';
import '../admin.css';

export default function AgendaDashboard() {
  const router = useRouter();
  const [slots, setSlots] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [teacher, setTeacher] = useState('');
  const [instrument, setInstrument] = useState('');
  const [capacity, setCapacity] = useState('1');

  useEffect(() => {
    const qSlots = query(collection(db, 'agenda_slots'), orderBy('date', 'asc'), orderBy('time', 'asc'));
    const unsub = onSnapshot(qSlots, (snapshot) => {
      setSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!date || !time || !teacher || !instrument) return;

    try {
      await addDoc(collection(db, 'agenda_slots'), {
        date,
        time,
        teacher,
        instrument,
        capacity: parseInt(capacity),
        booked: 0,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setDate(''); setTime(''); setTeacher(''); setInstrument(''); setCapacity('1');
    } catch (error) {
      console.error("Error adding slot: ", error);
      alert("Error al guardar el cupo");
    }
  };

  const handleDelete = async (id) => {
    if(confirm("¿Estás seguro de eliminar este horario?")) {
      await deleteDoc(doc(db, 'agenda_slots', id));
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => router.push('/admin')} className="back-button">
            <ArrowLeft size={24} color="#00DE85" />
          </button>
          <div>
            <h1 className="admin-title">Agenda MPS</h1>
            <p className="admin-subtitle">Configuración de Horarios y Cupos</p>
          </div>
        </div>
        <button className="logout-button" onClick={() => setIsAdding(!isAdding)}>
          <Plus size={20} /> {isAdding ? 'Cancelar' : 'Abrir Nuevo Cupo'}
        </button>
      </div>

      <div className="admin-content">
        {isAdding && (
          <div className="panel" style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Detalles de la Clase</h2>
            <form onSubmit={handleAddSlot} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Fecha (YYYY-MM-DD)</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Hora (Ej. 16:00)</label>
                <input type="time" required value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Profesor</label>
                <input type="text" placeholder="Ej. Profe Test" required value={teacher} onChange={e => setTeacher(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Instrumento</label>
                <input type="text" placeholder="Ej. Guitarra" required value={instrument} onChange={e => setInstrument(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Cupos Max</label>
                <input type="number" min="1" required value={capacity} onChange={e => setCapacity(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Guardar Cupo</button>
              </div>
            </form>
          </div>
        )}

        <div className="panel">
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={24} color="#00DE85" /> Horarios Activos
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {slots.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No hay horarios configurados aún.</p>
            ) : (
              slots.map(slot => (
                <div key={slot.id} style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.2rem' }}>{slot.date} | {slot.time}</h3>
                    <p style={{ color: '#00DE85', fontWeight: 'bold', marginBottom: '0.5rem' }}>{slot.instrument}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Profesor: {slot.teacher}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Reservados: {slot.booked} / {slot.capacity}</p>
                  </div>
                  <button onClick={() => handleDelete(slot.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', alignSelf: 'flex-start' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
