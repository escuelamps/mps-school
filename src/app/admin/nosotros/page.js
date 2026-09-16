'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Trash2, Mail, UserPlus, DollarSign, CreditCard, Lock } from 'lucide-react';
import '../admin.css';

const FIREBASE_API_KEY = "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28";

export default function ProfesoresPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qTeachers = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const unsubTeachers = onSnapshot(qTeachers, (snapshot) => {
      setTeachers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.name||'').localeCompare(b.name||'')));
    });

    return () => unsubTeachers();
  }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = `profe-${firstName.toLowerCase().trim()}.${lastName.toLowerCase().trim()}@mps.com`;
      const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      
      const userId = data.localId;
      await setDoc(doc(db, 'users', userId), {
        name: `${firstName} ${lastName}`,
        email: email,
        role: 'teacher',
        hourlyRate: Number(hourlyRate),
        bankAccount: bankAccount,
        schedule: { start: '08:00', end: '18:00' }
      });

      setIsAdding(false);
      setFirstName(''); setLastName(''); setPassword(''); setHourlyRate(''); setBankAccount('');
    } catch (error) {
      console.error("Error creating teacher: ", error);
      alert('Error al crear el profesor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(confirm('¿Estás seguro de eliminar el registro de este profesor?')) {
      await deleteDoc(doc(db, 'users', id));
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
            <h1 className="admin-title">Profesores</h1>
            <p className="admin-subtitle">Directorio y gestión del cuerpo docente (CRUD)</p>
          </div>
        </div>
        <button className="logout-button" onClick={() => setIsAdding(!isAdding)}>
          <UserPlus size={20} /> {isAdding ? 'Cancelar' : 'Nuevo Profesor'}
        </button>
      </div>

      <div className="admin-content">
        
        {/* --- FORMULARIO ALTA PROFESOR --- */}
        {isAdding && (
          <div className="panel" style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Datos Contractuales del Profesor</h2>
            
            <form onSubmit={handleCreateTeacher} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nombre</label>
                <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Apellido</label>
                <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" required minLength="6" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#00DE85', marginBottom: '0.5rem', fontWeight: 'bold' }}>Valor a pagar por Hora ($)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} color="#00DE85" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="number" required value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid #00DE85' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#00DE85', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nequi / Número de Cuenta</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard size={16} color="#00DE85" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" required value={bankAccount} onChange={e => setBankAccount(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid #00DE85' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Guardando...' : 'Crear Profesor'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="panel">
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={24} color="#00DE85" /> Profesores Registrados ({teachers.length})
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {teachers.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No hay profesores registrados.</p>
            ) : (
              teachers.map(teacher => (
                <div key={teacher.id} style={{ padding: '1.5rem', background: 'var(--bg-darker)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.2rem' }}>{teacher.name}</h3>
                    <p style={{ color: '#00DE85', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}><Mail size={14}/> {teacher.email}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Tarifa: ${teacher.hourlyRate || 0}/hr | Cuenta: {teacher.bankAccount || 'N/A'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleDelete(teacher.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
