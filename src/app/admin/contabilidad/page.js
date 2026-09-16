'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { UserPlus, ArrowLeft, Trash2, Mail, Lock, DollarSign, CreditCard, Calculator, Calendar } from 'lucide-react';
import '../admin.css';

const FIREBASE_API_KEY = "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28"; // Secondary auth instance

export default function AdminContabilidad() {
  const router = useRouter();
  
  // Teachers State
  const [teachers, setTeachers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);

  // Payroll State
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [payrollReport, setPayrollReport] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snapshot) => {
      const teacherList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.role === 'teacher')
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setTeachers(teacherList);
    });
    return () => unsub();
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
    if(confirm("¿Estás seguro de eliminar el registro contable de este profesor?")) {
      await deleteDoc(doc(db, 'users', id));
    }
  };

  // --- Payroll Engine ---
  const calculatePayroll = async () => {
    setIsCalculating(true);
    try {
      const slotsSnapshot = await getDocs(collection(db, 'agenda_slots'));
      const allSlots = slotsSnapshot.docs.map(d => d.data());
      
      // Filter by selected month (format YYYY-MM)
      const monthSlots = allSlots.filter(s => s.date && s.date.startsWith(selectedMonth));

      const report = teachers.map(teacher => {
        const teacherSlots = monthSlots.filter(s => s.teacher === teacher.name);
        
        let totalMinutes = 0;
        let classesTaught = 0;

        teacherSlots.forEach(slot => {
          // If the slot has enrolled students (even if 1), we count it as taught
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

      // Filter out teachers who didn't teach any classes
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
            <h1 className="admin-title">Contabilidad y Nómina</h1>
            <p className="admin-subtitle">Motor de cálculo financiero</p>
          </div>
        </div>
        <button className="logout-button" onClick={() => setIsAdding(!isAdding)}>
          <UserPlus size={20} /> {isAdding ? 'Cancelar' : 'Alta de Profesor'}
        </button>
      </div>

      <div className="admin-content">
        
        {/* --- CALCULADORA DE NÓMINA (FASE 3) --- */}
        <div className="panel" style={{ marginBottom: '2rem', border: '1px solid #00DE85' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={24} color="#00DE85" /> Calculadora de Nómina (Mensual)
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            El sistema escaneará la agenda del mes seleccionado, buscará todas las clases que tuvieron <strong>al menos un alumno inscrito</strong> y multiplicará el tiempo dictado por la tarifa por hora de cada profesor.
          </p>

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
              style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {isCalculating ? 'Calculando...' : 'Ejecutar Cálculo'}
            </button>
          </div>

          {/* Report Table */}
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
                  {/* Totals Row */}
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
                <input type="text" required minLength="6" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#00DE85', marginBottom: '0.5rem', fontWeight: 'bold' }}>Valor a pagar por Hora ($)</label>
                <input type="number" required value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid #00DE85' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#00DE85', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nequi / Número de Cuenta</label>
                <input type="text" required value={bankAccount} onChange={e => setBankAccount(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid #00DE85' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Procesando...' : 'Crear y Vincular'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- LISTADO BASE --- */}
        <div className="panel">
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={24} color="#00DE85" /> Directorio Contable
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {teachers.map(teacher => (
              <div key={teacher.id} style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{teacher.name}</h3>
                  <p style={{ color: '#00DE85', fontSize: '0.9rem', fontWeight: 'bold' }}>Tarifa: ${teacher.hourlyRate ? teacher.hourlyRate.toLocaleString() : '0'}/hr</p>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>Nequi: {teacher.bankAccount || 'No registrado'}</p>
                </div>
                <button onClick={() => handleDelete(teacher.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
