'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { UserPlus, ArrowLeft, Trash2, Mail, Lock, DollarSign, CreditCard } from 'lucide-react';
import '../admin.css';

const FIREBASE_API_KEY = "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28"; // Mismo API key del entorno para no desloguear

export default function AdminContabilidad() {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const unsub = onSnapshot(q, (snapshot) => {
      setTeachers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const generateEmail = (first, last) => {
    const cleanStr = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '');
    return `profe-${cleanStr(first)}${cleanStr(last)}@escuelamps.com`;
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !password || !hourlyRate || !bankAccount) return;
    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const generatedEmail = generateEmail(firstName, lastName);

    try {
      // 1. Create user via REST API (so admin doesn't get logged out)
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: generatedEmail,
          password: password,
          returnSecureToken: true
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || "Error al crear cuenta en Firebase Auth");
      }

      const uid = data.localId;

      // 2. Save profile in Firestore with accounting data
      await setDoc(doc(db, 'users', uid), {
        email: generatedEmail,
        name: `${firstName.trim()} ${lastName.trim()}`,
        role: 'teacher',
        hourlyRate: parseFloat(hourlyRate),
        bankAccount: bankAccount,
        createdAt: serverTimestamp()
      });

      alert(`Profesor (Nómina) creado con éxito!\n\nUsuario: ${generatedEmail}\nContraseña: ${password}\nTarifa: $${hourlyRate}/hr\nNequi: ${bankAccount}`);
      setIsAdding(false);
      setFirstName(''); setLastName(''); setPassword(''); setHourlyRate(''); setBankAccount('');
    } catch (error) {
      console.error("Error creating teacher: ", error);
      alert(error.message === 'EMAIL_EXISTS' ? 'Este profesor ya existe.' : 'Error al crear el profesor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(confirm("¿Estás seguro de eliminar el registro contable de este profesor?")) {
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
            <h1 className="admin-title">Contabilidad y Nómina</h1>
            <p className="admin-subtitle">Gestión financiera y alta de docentes</p>
          </div>
        </div>
        <button className="logout-button" onClick={() => setIsAdding(!isAdding)}>
          <UserPlus size={20} /> {isAdding ? 'Cancelar' : 'Alta de Profesor'}
        </button>
      </div>

      <div className="admin-content">
        {isAdding && (
          <div className="panel" style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Datos Contractuales del Profesor</h2>
            
            <div style={{ padding: '1rem', background: 'rgba(0, 222, 133, 0.1)', border: '1px solid rgba(0, 222, 133, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>💡 <strong>Automatización:</strong> El correo se generará solo (`profe-...`) y el docente quedará vinculado al módulo de nómina.</p>
            </div>

            <form onSubmit={handleCreateTeacher} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {/* Datos Personales */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nombre</label>
                <input type="text" placeholder="Ej. Carlos" required value={firstName} onChange={e => setFirstName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Apellido</label>
                <input type="text" placeholder="Ej. Gómez" required value={lastName} onChange={e => setLastName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Contraseña de Acceso</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Mínimo 6 caracteres" required minLength="6" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>
              </div>

              {/* Datos Financieros */}
              <div>
                <label style={{ display: 'block', color: '#00DE85', marginBottom: '0.5rem', fontWeight: 'bold' }}>Valor a pagar por Hora ($)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} color="#00DE85" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="number" placeholder="Ej. 25000" required value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid #00DE85' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#00DE85', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nequi / Número de Cuenta</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard size={16} color="#00DE85" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Celular Nequi" required value={bankAccount} onChange={e => setBankAccount(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid #00DE85' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Procesando Nómina...' : 'Crear y Vincular'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="panel">
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={24} color="#00DE85" /> Nómina Activa (Profesores)
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {teachers.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No hay personal registrado en nómina.</p>
            ) : (
              teachers.map(teacher => (
                <div key={teacher.id} style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{teacher.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={14}/> {teacher.email}</p>
                    <p style={{ color: '#00DE85', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
                      <DollarSign size={14}/> Tarifa: ${teacher.hourlyRate ? teacher.hourlyRate.toLocaleString() : '0'}/hr
                    </p>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CreditCard size={14}/> Nequi: {teacher.bankAccount || 'No registrado'}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(teacher.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>
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
