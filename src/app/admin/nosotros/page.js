'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Trash2, UserPlus, DollarSign, CreditCard, Lock, Edit2, FileText, BookOpen, Calendar, Search } from 'lucide-react';
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
  const [birthDate, setBirthDate] = useState('');
  const [subject1, setSubject1] = useState('');
  const [subject2, setSubject2] = useState('');
  const [password, setPassword] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Table Filters & Pagination
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    documentId: '',
    subjects: '',
    hourlyRate: '',
    bankAccount: ''
  });
  const [visibleCount, setVisibleCount] = useState(10);

  const getTeacherName = (t) => {
    if (t.name && t.name.trim()) return t.name.trim();
    if (t.email === 'lpineda@escuelamps.com' || t.username === 'lpineda') return 'Laura Pineda';
    if (t.email === 'william@escuelamps.com' || t.username === 'william') return 'William Buitrago';
    if (t.username) return t.username;
    return 'Profesor';
  };

  const getTeacherSubjects = (t) => {
    if (t.subjects && t.subjects.length > 0) return t.subjects;
    const subs = [t.subject1, t.subject2].filter(Boolean);
    if (subs.length > 0) return subs;
    if (t.username === 'william' || t.email === 'william@escuelamps.com') return ['Canto'];
    return [];
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.username || data.username !== 'juanse') {
          router.replace('/admin');
        }
      })
      .catch(() => router.replace('/admin'));

    const qTeachers = query(collection(db, 'users'), where('role', 'in', ['teacher', 'admin']));
    const unsubTeachers = onSnapshot(qTeachers, (snapshot) => {
      const teacherList = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a,b) => getTeacherName(a).localeCompare(getTeacherName(b)));
      setTeachers(teacherList);
    });
    return () => unsubTeachers();
  }, [router]);

  const openAddForm = () => {
    setEditingTeacherId(null);
    setFirstName('');
    setLastName('');
    setDocumentId('');
    setBirthDate('');
    setSubject1('');
    setSubject2('');
    setPassword('');
    setHourlyRate('');
    setBankAccount('');
    setIsAdding(!isAdding);
  };

  const openEditForm = (teacher) => {
    setEditingTeacherId(teacher.id);
    
    // Split name safely with fallbacks
    const fullName = getTeacherName(teacher);
    const nameParts = fullName.split(' ');
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
    
    setDocumentId(teacher.documentId || '');
    setBirthDate(teacher.birthDate || '');
    const subjects = getTeacherSubjects(teacher);
    setSubject1(teacher.subject1 || subjects[0] || '');
    setSubject2(teacher.subject2 || subjects[1] || '');
    
    setPassword('');
    setHourlyRate(teacher.hourlyRate !== undefined && teacher.hourlyRate !== null ? String(teacher.hourlyRate) : '');
    setBankAccount(teacher.bankAccount || '');
    
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const subjectsArray = [subject1, subject2].filter(Boolean);

      if (editingTeacherId) {
        // Edit Mode
        const updateData = {
          name: `${firstName} ${lastName}`.trim(),
          documentId: documentId,
          birthDate: birthDate,
          subject1: subject1,
          subject2: subject2,
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
          birthDate: birthDate,
          subjects: subjectsArray,
          hourlyRate: Number(hourlyRate),
          bankAccount: bankAccount,
          schedule: { start: '08:00', end: '18:00' }
        });
        alert('Profesor registrado correctamente.');
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

  // Filter teachers based on column filters
  const filteredTeachers = teachers.filter(t => {
    const name = getTeacherName(t).toLowerCase();
    const docId = (t.documentId || '').toLowerCase();
    const subs = getTeacherSubjects(t).join(' ').toLowerCase();
    const rate = (t.hourlyRate !== undefined && t.hourlyRate !== null ? String(t.hourlyRate) : '').toLowerCase();
    const bank = (t.bankAccount || '').toLowerCase();

    if (columnFilters.name && !name.includes(columnFilters.name.toLowerCase().trim())) return false;
    if (columnFilters.documentId && !docId.includes(columnFilters.documentId.toLowerCase().trim())) return false;
    if (columnFilters.subjects && !subs.includes(columnFilters.subjects.toLowerCase().trim())) return false;
    if (columnFilters.hourlyRate && !rate.includes(columnFilters.hourlyRate.toLowerCase().trim())) return false;
    if (columnFilters.bankAccount && !bank.includes(columnFilters.bankAccount.toLowerCase().trim())) return false;

    return true;
  });

  const displayedTeachers = filteredTeachers.slice(0, visibleCount);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => router.push('/admin')} className="back-button">
            <ArrowLeft size={24} color="#00DE85" />
          </button>
          <div>
            <h1 className="admin-title">Base de Datos Profesores</h1>
            <p className="admin-subtitle">Directorio y gestión contractual del cuerpo docente</p>
          </div>
        </div>
        <button 
          style={{ 
            background: "#00DE85", 
            color: "#111", 
            border: "none", 
            padding: "0.6rem 1.2rem", 
            borderRadius: "8px", 
            fontWeight: "bold", 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem" 
          }} 
          onClick={openAddForm}
        >
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
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Fecha de Nacimiento</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>
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

        {/* --- TABLA IDÉNTICA A ESTUDIANTES ACTIVOS --- */}
        <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={22} color="#00DE85" /> Profesores Registrados ({teachers.length})
            </h2>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Mostrando {displayedTeachers.length} de {filteredTeachers.length} profesores
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Editar</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Nombre del Docente</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Documento (CC / TI)</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Asignaturas / Especialidades</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Tarifa / Hora</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Cuenta / Nequi</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: '#ef4444', whiteSpace: 'nowrap' }}>Eliminar</th>
                </tr>
                {/* Fila de Filtros por Columna */}
                <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '0.4rem 1rem' }}></th>
                  <th style={{ padding: '0.4rem 0.6rem' }}>
                    <input 
                      type="text" 
                      placeholder="Filtrar nombre..."
                      value={columnFilters.name}
                      onChange={(e) => {
                        setColumnFilters(prev => ({ ...prev, name: e.target.value }));
                        setVisibleCount(10);
                      }}
                      style={{
                        width: '100%',
                        minWidth: '110px',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem',
                        outline: 'none'
                      }}
                    />
                  </th>
                  <th style={{ padding: '0.4rem 0.6rem' }}>
                    <input 
                      type="text" 
                      placeholder="Filtrar doc..."
                      value={columnFilters.documentId}
                      onChange={(e) => {
                        setColumnFilters(prev => ({ ...prev, documentId: e.target.value }));
                        setVisibleCount(10);
                      }}
                      style={{
                        width: '100%',
                        minWidth: '90px',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem',
                        outline: 'none'
                      }}
                    />
                  </th>
                  <th style={{ padding: '0.4rem 0.6rem' }}>
                    <input 
                      type="text" 
                      placeholder="Filtrar asignaturas..."
                      value={columnFilters.subjects}
                      onChange={(e) => {
                        setColumnFilters(prev => ({ ...prev, subjects: e.target.value }));
                        setVisibleCount(10);
                      }}
                      style={{
                        width: '100%',
                        minWidth: '110px',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem',
                        outline: 'none'
                      }}
                    />
                  </th>
                  <th style={{ padding: '0.4rem 0.6rem' }}>
                    <input 
                      type="text" 
                      placeholder="Filtrar tarifa..."
                      value={columnFilters.hourlyRate}
                      onChange={(e) => {
                        setColumnFilters(prev => ({ ...prev, hourlyRate: e.target.value }));
                        setVisibleCount(10);
                      }}
                      style={{
                        width: '100%',
                        minWidth: '90px',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem',
                        outline: 'none'
                      }}
                    />
                  </th>
                  <th style={{ padding: '0.4rem 0.6rem' }}>
                    <input 
                      type="text" 
                      placeholder="Filtrar cuenta..."
                      value={columnFilters.bankAccount}
                      onChange={(e) => {
                        setColumnFilters(prev => ({ ...prev, bankAccount: e.target.value }));
                        setVisibleCount(10);
                      }}
                      style={{
                        width: '100%',
                        minWidth: '100px',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem',
                        outline: 'none'
                      }}
                    />
                  </th>
                  <th style={{ padding: '0.4rem 1rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {displayedTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      No se encontraron profesores con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  displayedTeachers.map((teacher) => {
                    const subjects = getTeacherSubjects(teacher);
                    return (
                      <tr 
                        key={teacher.id} 
                        style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} 
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} 
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.7rem 1rem' }}>
                          <button 
                            onClick={() => openEditForm(teacher)} 
                            title="Editar profesor" 
                            style={{ 
                              background: 'var(--accent)', 
                              color: 'black', 
                              border: 'none', 
                              padding: '0.35rem 0.6rem', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.3rem', 
                              fontSize: '0.8rem', 
                              fontWeight: 600 
                            }}
                          >
                            <Edit2 size={13} /> Editar
                          </button>
                        </td>
                        <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          {getTeacherName(teacher)}
                        </td>
                        <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {teacher.documentId || '-'}
                        </td>
                        <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem' }}>
                          {subjects.length > 0 ? (
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              {subjects.map((sub, idx) => (
                                <span 
                                  key={idx} 
                                  style={{ 
                                    background: 'rgba(0,222,133,0.1)', 
                                    color: '#00DE85', 
                                    padding: '2px 8px', 
                                    borderRadius: '4px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', color: '#00DE85', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {teacher.hourlyRate ? `$${Number(teacher.hourlyRate).toLocaleString('es-CO')}` : '-'}
                        </td>
                        <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          {teacher.bankAccount || '-'}
                        </td>
                        <td style={{ padding: '0.7rem 1rem', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDelete(teacher.id)} 
                            title="Eliminar registro" 
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              color: '#ef4444', 
                              cursor: 'pointer', 
                              padding: '0.4rem',
                              borderRadius: '6px'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Paginación: Botón Cargar Más */}
            {filteredTeachers.length > visibleCount && (
              <div style={{ padding: '1.2rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.01)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Mostrando {displayedTeachers.length} de {filteredTeachers.length} profesores
                </span>
                <button
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  style={{
                    background: 'transparent',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent)',
                    padding: '0.6rem 1.8rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--accent)';
                    e.currentTarget.style.color = '#000';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                >
                  Cargar más (+10)
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
