'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, onSnapshot, doc, setDoc, deleteDoc, where } from 'firebase/firestore';
import { ArrowLeft, Trash2, Mail, Lock, DollarSign, Calculator, Calendar, Users, UserPlus, Edit2 } from 'lucide-react';
import '../admin.css';

const FIREBASE_API_KEY = "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28";

export default function AdminContabilidad() {
  const router = useRouter();
  
  // Teachers State (for Payroll)
  const [teachers, setTeachers] = useState([]);
  
  // Students State (for CRUD)
  const [students, setStudents] = useState([]);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  
  // Student Form State
  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentBirthDate, setStudentBirthDate] = useState('');
  const [studentInstrument, setStudentInstrument] = useState('');
  const [loading, setLoading] = useState(false);

  // Payroll State
  const [selectedMonth, setSelectedMonth] = useState(""); // YYYY-MM
  const [payrollReport, setPayrollReport] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setSelectedMonth(new Date().toISOString().slice(0, 7));

    // Listen to Teachers
    const qTeachers = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const unsubTeachers = onSnapshot(qTeachers, (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    });

    // Listen to Students
    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubStudents = onSnapshot(qStudents, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    });

    return () => { unsubTeachers(); unsubStudents(); };
  }, []);

  
  const openEditStudentForm = (student) => {
    setEditingStudentId(student.id);
    const nameParts = (student.name || '').split(' ');
    setStudentFirstName(nameParts[0] || '');
    setStudentLastName(nameParts.slice(1).join(' ') || '');
    setStudentPassword('');
      setStudentBirthDate('');
      setStudentInstrument('');
    setStudentBirthDate(student.birthDate || '');
    setStudentInstrument(student.instrument || '');
    setIsAddingStudent(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingStudentId) {
        // Modo Edición
        await updateDoc(doc(db, 'users', editingStudentId), {
          name: `${studentFirstName} ${studentLastName}`
        });
        alert('Estudiante actualizado correctamente.');
      } else {
        // Modo Creación
        const email = `estudiante-${studentFirstName.toLowerCase().trim()}.${studentLastName.toLowerCase().trim()}@escuelamps.com`;
        const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
        const res = await fetch(authUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: studentPassword, returnSecureToken: true })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        
        const userId = data.localId;
        await setDoc(doc(db, 'users', userId), {
          name: `${studentFirstName} ${studentLastName}`,
          email: email,
          role: 'student'
        });
      }

      setStudentFirstName('');
      setStudentLastName('');
      setStudentPassword('');
      setIsAddingStudent(false);
      setEditingStudentId(null);

      setStudentFirstName(''); setStudentLastName(''); setStudentPassword('');
    } catch (error) {
      console.error("Error creating student: ", error);
      alert('Error al crear el estudiante.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if(confirm("¿Estás seguro de eliminar el registro financiero de este estudiante?")) {
      await deleteDoc(doc(db, 'users', id));
    }
  };

  // --- Payroll Engine ---
  const calculatePayroll = async () => {
    setIsCalculating(true);
    try {
      const slotsSnapshot = await getDocs(collection(db, 'agenda_slots'));
      const allSlots = slotsSnapshot.docs.map(d => d.data());
      
      const monthSlots = allSlots.filter(s => s.date && s.date.startsWith(selectedMonth));

      const report = teachers.map(teacher => {
        const teacherSlots = monthSlots.filter(s => s.teacher === teacher.name);
        
        let totalMinutes = 0;
        let classesTaught = 0;

        teacherSlots.forEach(slot => {
          if (slot.students && slot.students.length > 0) {
            totalMinutes += (slot.duration || 60);
            classesTaught++;
          }
        });

        const totalHours = totalMinutes / 60;
        const rate = teacher.hourlyRate || 0;
        const totalToPay = totalHours * rate;

        return {
          id: teacher.id,
          name: teacher.name,
          bankAccount: teacher.bankAccount,
          hourlyRate: rate,
          classesTaught,
          totalHours,
          totalToPay
        };
      });

      setPayrollReport(report.filter(r => r.classesTaught > 0));
    } catch (err) {
      console.error("Error calculando nómina:", err);
      alert("Hubo un error calculando la nómina");
    } finally {
      setIsCalculating(false);
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
            <h1 className="admin-title">Contabilidad y Estudiantes</h1>
            <p className="admin-subtitle">Nómina docente y alta de estudiantes </p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        
        {/* --- CALCULADORA DE NÓMINA (FASE 3) --- */}
        <div className="panel" style={{ marginBottom: '2rem', border: '1px solid #00DE85' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={24} color="#00DE85" /> Calculadora de Nómina
          </h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Mes a Liquidar</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={e => setSelectedMonth(e.target.value)} 
                  style={{ padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} 
                />
              </div>
            </div>
            <button 
              onClick={calculatePayroll}
              disabled={isCalculating}
              style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              {isCalculating ? 'Calculando...' : 'Ejecutar Cálculo'}
            </button>
          </div>

          {payrollReport.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem' }}>Profesor</th>
                    <th style={{ padding: '1rem' }}>Cuenta / Nequi</th>
                    <th style={{ padding: '1rem' }}>Clases Efectivas</th>
                    <th style={{ padding: '1rem' }}>Horas Totales</th>
                    <th style={{ padding: '1rem' }}>Tarifa/Hora</th>
                    <th style={{ padding: '1rem', color: '#00DE85', textAlign: 'right' }}>Total a Pagar</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollReport.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{row.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{row.bankAccount || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>{row.classesTaught}</td>
                      <td style={{ padding: '1rem' }}>{row.totalHours.toFixed(2)}h</td>
                      <td style={{ padding: '1rem' }}>${row.hourlyRate.toLocaleString()}</td>
                      <td style={{ padding: '1rem', color: '#00DE85', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'right' }}>
                        ${row.totalToPay.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: 'rgba(0, 222, 133, 0.1)' }}>
                    <td colSpan="5" style={{ padding: '1rem', fontWeight: 'bold', textAlign: 'right' }}>Gran Total Nómina:</td>
                    <td style={{ padding: '1rem', color: '#00DE85', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'right' }}>
                      ${payrollReport.reduce((sum, r) => sum + r.totalToPay, 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- CRUD DE ESTUDIANTES --- */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={24} color="#00DE85" /> Directorio Financiero de Estudiantes ({students.length})
            </h2>
            <button 
              onClick={() => setIsAddingStudent(!isAddingStudent)}
              style={{ background: '#00DE85', color: '#111', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <UserPlus size={18} /> {isAddingStudent && !editingStudentId ? 'Cancelar' : 'Nuevo Estudiante'}
            </button>
          </div>

          {isAddingStudent && (
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: 'var(--text-primary)' }}>{editingStudentId ? 'Editar Estudiante' : 'Crear Ficha de Estudiante'}</h3>
                {editingStudentId && (
                  <button onClick={() => { setIsAddingStudent(false); setEditingStudentId(null); }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar Edición</button>
                )}
              </div>
              <form onSubmit={handleCreateStudent} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nombre</label>
                  <input type="text" required value={studentFirstName} onChange={e => setStudentFirstName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Apellido</label>
                  <input type="text" required value={studentLastName} onChange={e => setStudentLastName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>
                
                
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Instrumento</label>
                  <input type="text" value={studentInstrument} onChange={e => setStudentInstrument(e.target.value)} placeholder="Ej. Piano, Guitarra..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Fecha de Nacimiento</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="date" value={studentBirthDate} onChange={e => setStudentBirthDate(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                  </div>
                </div>

                {!editingStudentId && (<div><label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Contraseña de acceso</label><div style={{ position: 'relative' }}><Lock size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} /><input type="text" required minLength="6" value={studentPassword} onChange={e => setStudentPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} /></div></div>)}
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Guardando...' : (editingStudentId ? 'Actualizar Estudiante' : 'Guardar Estudiante')}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {students.map(student => (
              <div key={student.id} style={{ padding: '1.5rem', background: 'var(--bg-darker)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.2rem' }}>{student.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={14}/> {student.email?.replace(/@.*$/, "")}</p>
                  <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold' }}>🎸 {student.instrument || 'Sin instrumento'}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14}/> {student.birthDate || 'Sin fecha de nacimiento'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditStudentForm(student)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.5rem' }}>
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => handleDeleteStudent(student.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>
                  <Trash2 size={20} />
                </button>
                </div>
              </div>
            ))}
            {students.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No hay estudiantes registrados.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
