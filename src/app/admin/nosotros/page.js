'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Trash2, Mail, UserPlus, DollarSign, CreditCard, Lock, Edit2, FileText, BookOpen } from 'lucide-react';
import '../admin.css';

const FIREBASE_API_KEY = "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28";

export default function ProfesoresPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [subject1, setSubject1] = useState('');
  const [subject2, setSubject2] = useState('');
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

  const openAddForm = () => {
    setEditingTeacherId(null);
    setFirstName('');
    setLastName('');
    setDocumentId('');
    setSubject1('');
    setSubject2('');
    setPassword('');
    setHourlyRate('');
    setBankAccount('');
    setIsAdding(!isAdding);
  };

  const openEditForm = (teacher) => {
    setEditingTeacherId(teacher.id);
    
    // Split name safely
    const nameParts = (teacher.name || '').split(' ');
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
    
    setDocumentId(teacher.documentId || '');
    setSubject1(teacher.subjects?.[0] || '');
    setSubject2(teacher.subjects?.[1] || '');
    
    setPassword(''); // Don't fetch password, it's secure
    setHourlyRate(teacher.hourlyRate || '');
    setBankAccount(teacher.bankAccount || '');
    
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const subjectsArray = [subject1, subject2].filter(Boolean); // Solo guarda las que no estén vacías

      if (editingTeacherId) {
        // Edit Mode
        const updateData = {
          name: `${firstName} ${lastName}`,
          documentId: documentId,
          subjects: subjectsArray,
          hourlyRate: Number(hourlyRate),
          bankAccount: bankAccount
        };
        await updateDoc(doc(db, 'users', editingTeacherId), updateData);
        alert('Profesor actualizado correctamente.');
      } else {
        // Create Mode
        const email = `profe-${firstName.toLowerCase().trim()}.${lastName.toLowerCase().trim()}@escuelamps.com`;
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
          documentId: documentId,
          subjects: subjectsArray,
          hourlyRate: Number(hourlyRate),
          bankAccount: bankAccount,
          schedule: { start: '08:00', end: '18:00' }
        });
      }

      setIsAdding(false);
      setEditingTeacherId(null);
      setFirstName(''); setLastName(''); setDocumentId(''); setSubject1(''); setSubject2(''); setPassword(''); setHourlyRate(''); setBankAccount('');
    } catch (error) {
      console.error("Error saving teacher: ", error);
      alert('Hubo un error al guardar los datos del profesor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(confirm('¿Estás seguro de eliminar el registro de este profesor? (Nota: Esto no borrará su cuenta Auth por seguridad)')) {
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
            <p className="admin-subtitle">Directorio y gestión del cuerpo docente</p>
          </div>
        </div>
        <button className="logout-button" onClick={openAddForm}>
          <UserPlus size={20} /> {isAdding && !editingTeacherId ? 'Cancelar' : 'Nuevo Profesor'}
        </button>
      </div>

      <div className="admin-content">
        
        {/* --- FORMULARIO ALTA/EDICIÓN PROFESOR --- */}
        {isAdding && (
          <div className="panel" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: 'var(--text-primary)' }}>
                {editingTeacherId ? 'Editar Datos del Profesor' : 'Datos Contractuales del Profesor'}
              </h2>
              {editingTeacherId && (
                <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar Edición</button>
              )}
            </div>
            
            <form onSubmit={handleSaveTeacher} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nombre</label>
                <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Apellido</label>
                <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Número de Documento</label>
                <div style={{ position: 'relative' }}>
                  <FileText size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" required value={documentId} onChange={e => setDocumentId(e.target.value)} placeholder="CC / TI / NIT" style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Asignatura Principal *</label>
                <div style={{ position: 'relative' }}>
                  <BookOpen size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" required value={subject1} onChange={e => setSubject1(e.target.value)} placeholder="Ej: Batería, Piano, Canto" style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Asignatura Secundaria (Opcional)</label>
                <div style={{ position: 'relative' }}>
                  <BookOpen size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" value={subject2} onChange={e => setSubject2(e.target.value)} placeholder="Ej: Teoría Musical" style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>
              </div>

              {!editingTeacherId && (
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Contraseña (Mínimo 6)</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" required minLength="6" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                  </div>
                </div>
              )}

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
              <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Guardando...' : (editingTeacherId ? 'Actualizar Profesor' : 'Crear Profesor')}
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
                <div key={teacher.id} style={{ padding: '1.5rem', background: 'var(--bg-darker)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.2rem' }}>{teacher.name}</h3>
                    <p style={{ color: '#00DE85', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}><Mail size={14}/> {teacher.email}</p>
                    
                    {teacher.documentId && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FileText size={12}/> CC: {teacher.documentId}</p>
                    )}
                    
                    {teacher.subjects && teacher.subjects.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {teacher.subjects.map((sub, idx) => (
                          <span key={idx} style={{ background: 'rgba(0,222,133,0.1)', color: '#00DE85', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{sub}</span>
                        ))}
                      </div>
                    )}

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.8rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
                      Tarifa: ${teacher.hourlyRate || 0}/hr | Cuenta: {teacher.bankAccount || 'N/A'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <button onClick={() => openEditForm(teacher)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.5rem' }} title="Editar">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => handleDelete(teacher.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }} title="Eliminar">
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
