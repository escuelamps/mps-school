'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { UserPlus, ArrowLeft, Trash2, Mail, Lock } from 'lucide-react';
import '../admin.css';

const FIREBASE_API_KEY = "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28";

export default function AdminProfesores() {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
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
    if (!firstName || !lastName || !password) return;
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

      // 2. Save profile in Firestore
      await setDoc(doc(db, 'users', uid), {
        email: generatedEmail,
        name: `${firstName.trim()} ${lastName.trim()}`,
        role: 'teacher',
        createdAt: serverTimestamp()
      });

      alert(`Profesor creado con éxito!\n\nUsuario: ${generatedEmail}\nContraseña: ${password}`);
      setIsAdding(false);
      setFirstName(''); setLastName(''); setPassword('');
    } catch (error) {
      console.error("Error creating teacher: ", error);
      alert(error.message === 'EMAIL_EXISTS' ? 'Este profesor ya existe.' : 'Error al crear el profesor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(confirm("¿Estás seguro de eliminar el registro de este profesor? (Nota: Esto no borrará su cuenta de Auth por seguridad, solo su perfil)")) {
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
            <h1 className="admin-title">Gestión de Profesores</h1>
            <p className="admin-subtitle">Creación de accesos para el cuerpo docente</p>
          </div>
        </div>
        <button className="logout-button" onClick={() => setIsAdding(!isAdding)}>
          <UserPlus size={20} /> {isAdding ? 'Cancelar' : 'Nuevo Profesor'}
        </button>
      </div>

      <div className="admin-content">
        {isAdding && (
          <div className="panel" style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Datos del Nuevo Profesor</h2>
            
            <div style={{ padding: '1rem', background: 'rgba(0, 222, 133, 0.1)', border: '1px solid rgba(0, 222, 133, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>💡 El correo electrónico se generará automáticamente usando la regla: <strong>profe-[nombre][apellido]@escuelamps.com</strong></p>
            </div>

            <form onSubmit={handleCreateTeacher} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nombre</label>
                <input type="text" placeholder="Ej. Carlos" required value={firstName} onChange={e => setFirstName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Apellido</label>
                <input type="text" placeholder="Ej. Gómez" required value={lastName} onChange={e => setLastName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Mínimo 6 caracteres" required minLength="6" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>

            {(firstName || lastName) && (
              <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Vista previa del correo: <strong style={{ color: '#00DE85' }}>{generateEmail(firstName, lastName)}</strong>
              </div>
            )}
          </div>
        )}

        <div className="panel">
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={24} color="#7e22ce" /> Profesores Registrados
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {teachers.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No hay profesores registrados aún.</p>
            ) : (
              teachers.map(teacher => (
                <div key={teacher.id} style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.2rem' }}>{teacher.name}</h3>
                    <p style={{ color: '#00DE85', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={14}/> {teacher.email}</p>
                  </div>
                  <button onClick={() => handleDelete(teacher.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
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
