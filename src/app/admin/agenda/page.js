'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, Settings, Trash2, ArrowLeft, X, Calendar as CalIcon, UserPlus } from 'lucide-react';
import '../admin.css';

const START_HOUR = 8;
const END_HOUR = 21;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const PIXELS_PER_HOUR = 60;
const HOURS_ARRAY = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => `${(i + START_HOUR).toString().padStart(2, '0')}:00`);
const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];


const getInstrumentIcon = (instrumentName) => {
  if (!instrumentName) return '🎵';
  const name = instrumentName.toLowerCase();
  if (name.includes('piano') || name.includes('teclado')) return '🎹';
  if (name.includes('guitarra') || name.includes('bajo') || name.includes('cuerda') || name.includes('ukelele')) return '🎸';
  if (name.includes('violín') || name.includes('violin') || name.includes('chelo')) return '🎻';
  if (name.includes('batería') || name.includes('bateria') || name.includes('percusi')) return '🥁';
  if (name.includes('vocal') || name.includes('canto') || name.includes('voz') || name.includes('técnica')) return '🎤';
  if (name.includes('actuación') || name.includes('actuacion') || name.includes('teatro')) return '🎭';
  if (name.includes('saxo') || name.includes('viento')) return '🎷';
  if (name.includes('producción') || name.includes('produccion') || name.includes('audio')) return '🎧';
  if (name.includes('marketing')) return '📈';
  return '🎵';
};

export default function AgendaProDashboard() {
  const router = useRouter();
  
  // Data State
  const [teachers, setTeachers] = useState([]);
  const [studentsList, setStudentsList] = useState([]); // All registered students
  const [allSlots, setAllSlots] = useState([]);
  
  // UI State
  const [viewMode, setViewMode] = useState('day'); 
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [branchFilter, setBranchFilter] = useState('Todas');
  const [weekTeacherId, setWeekTeacherId] = useState(''); 
  
  // Modals
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [studentToEnroll, setStudentToEnroll] = useState('');
  
  // Form State (Slot)
  const [time, setTime] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [instrument, setInstrument] = useState('');
  const [capacity, setCapacity] = useState('5');
  const [duration, setDuration] = useState('60'); 
  const [recurrenceWeeks, setRecurrenceWeeks] = useState('1');
  const [branch, setBranch] = useState('Sede Principal');
  const [formDate, setFormDate] = useState(''); 

  const [draggingSlot, setDraggingSlot] = useState(null);

  useEffect(() => {
    // Fetch Teachers & Students
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const teacherData = allUsers
        .filter(u => u.role === 'teacher')
        .map(u => ({
          id: u.id, name: u.name || u.email, schedule: u.schedule || { start: '08:00', end: '18:00', breakStart: '', breakEnd: '' }
        })).sort((a, b) => a.name.localeCompare(b.name));
      
      setTeachers(teacherData);
      
      // FETCH STUDENTS FROM EXCEL INSTEAD OF FIREBASE
      try {
        const res = await fetch('/api/sheets?type=activos');
        const json = await res.json();
        if (json.data && json.data.length > 1) {
          const headers = json.data[0].map(h => h ? h.toLowerCase() : '');
          let nameIndex = headers.findIndex(h => h.includes('estudiante') || h.includes('nombre') || h.includes('alumno'));
          if (nameIndex === -1) nameIndex = 0; // fallback to first column
          
          const excelStudents = json.data.slice(1).map((row, i) => ({
            id: `excel_${i}`,
            name: row[nameIndex] || 'Desconocido'
          })).filter(s => s.name && s.name !== 'Desconocido');
          
          setStudentsList(excelStudents.sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (e) {
        console.error("Error trayendo alumnos del excel", e);
      }
      if(teacherData.length > 0) setWeekTeacherId(teacherData[0].id);
    };
    fetchUsers();

    // Fetch Slots
    const unsubSlots = onSnapshot(collection(db, 'agenda_slots'), (snapshot) => {
      setAllSlots(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        students: [], // fallback if old schema
        ...doc.data() 
      })));
    });
    return () => unsubSlots();
  }, []);

  // --- Math & Nav ---
  const getWeekDates = (baseDateStr) => {
    const baseDate = new Date(baseDateStr);
    const day = baseDate.getUTCDay();
    const diff = baseDate.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(baseDate.setUTCDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      return d.toISOString().split('T')[0];
    });
  };

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setUTCDate(d.getUTCDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const weekDates = getWeekDates(selectedDate);

  const displaySlots = allSlots.filter(s => {
    if (branchFilter !== 'Todas' && s.branch !== branchFilter) return false;
    if (viewMode === 'day') return s.date === selectedDate;
    if (viewMode === 'week') {
      const t = teachers.find(t => t.id === weekTeacherId);
      return t && s.teacher === t.name && weekDates.includes(s.date);
    }
    return false;
  });

  const timeToPixels = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return ((h - START_HOUR) * PIXELS_PER_HOUR) + ((m / 60) * PIXELS_PER_HOUR);
  };
  const pixelsToTime = (px) => {
    let totalMinutes = Math.max(0, Math.min((px / PIXELS_PER_HOUR) * 60, TOTAL_HOURS * 60));
    totalMinutes = Math.round(totalMinutes / 15) * 15;
    const h = Math.floor(totalMinutes / 60) + START_HOUR;
    return `${h.toString().padStart(2,'0')}:${Math.floor(totalMinutes % 60).toString().padStart(2,'0')}`;
  };

  // --- Drag Drop ---
  const handleDragStart = (e, slot) => { setDraggingSlot(slot); e.dataTransfer.effectAllowed = 'move'; };
  const handleDrop = async (e, colId) => {
    e.preventDefault();
    if (!draggingSlot) return;
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    const newTime = pixelsToTime(y);
    let newDate = draggingSlot.date, newTeacher = draggingSlot.teacher;
    viewMode === 'day' ? (newTeacher = colId) : (newDate = colId);
    
    await updateDoc(doc(db, 'agenda_slots', draggingSlot.id), { time: newTime, teacher: newTeacher, date: newDate });
    setDraggingSlot(null);
  };

  // --- Click to Create ---
  const handleBgClick = (e, colId) => {
    if (e.target !== e.currentTarget) return;
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    setSelectedSlot(null);
    setTime(pixelsToTime(y));
    setInstrument(''); setCapacity('5'); setDuration('60'); setRecurrenceWeeks('1');
    setBranch(branchFilter !== 'Todas' ? branchFilter : 'Sede Principal');
    
    if (viewMode === 'day') { setTeacherName(colId); setFormDate(selectedDate); } 
    else { const t = teachers.find(t => t.id === weekTeacherId); setTeacherName(t ? t.name : ''); setFormDate(colId); }
    setShowSlotModal(true);
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!formDate || !time || !teacherName || !instrument) return;
    try {
      const weeks = parseInt(recurrenceWeeks) || 1;
      const promises = [];
      const baseD = new Date(formDate);

      for (let i = 0; i < weeks; i++) {
        const d = new Date(baseD); d.setUTCDate(baseD.getUTCDate() + (i * 7));
        promises.push(addDoc(collection(db, 'agenda_slots'), {
          date: d.toISOString().split('T')[0],
          time, duration: parseInt(duration), teacher: teacherName, instrument, branch,
          capacity: parseInt(capacity), students: [], createdAt: serverTimestamp()
        }));
      }
      await Promise.all(promises);
      setShowSlotModal(false);
    } catch (err) { console.error(err); alert("Error"); }
  };

  // --- Fase 1: Enrollment & Payment Management ---
  const enrollStudent = async () => {
    if(!studentToEnroll) return;
    const st = studentsList.find(s => s.id === studentToEnroll);
    if(!st) return;
    
    // Default status: Confirmado, Debe
    const newStudentObj = { id: st.id, name: st.name, status: 'confirmado', payment: 'debe' };
    const updatedStudents = [...(selectedSlot.students || []), newStudentObj];
    
    await updateDoc(doc(db, 'agenda_slots', selectedSlot.id), { students: updatedStudents });
    setSelectedSlot({...selectedSlot, students: updatedStudents}); // update local modal state
    setStudentToEnroll('');
  };

  const removeStudent = async (index) => {
    const updated = [...selectedSlot.students];
    updated.splice(index, 1);
    await updateDoc(doc(db, 'agenda_slots', selectedSlot.id), { students: updated });
    setSelectedSlot({...selectedSlot, students: updated});
  };

  const updateStudentField = async (index, field, value) => {
    const updated = [...selectedSlot.students];
    updated[index][field] = value;
    await updateDoc(doc(db, 'agenda_slots', selectedSlot.id), { students: updated });
    setSelectedSlot({...selectedSlot, students: updated});
  };

  const handleDeleteSlot = async (id) => {
    if(confirm("¿Eliminar este horario?")) {
      await deleteDoc(doc(db, 'agenda_slots', id));
      setShowSlotModal(false);
    }
  };

  // --- Render ---
  const renderSlot = (slot) => {
    const top = timeToPixels(slot.time);
    const height = ((slot.duration || 60) / 60) * PIXELS_PER_HOUR;
    const enrolledCount = (slot.students || []).length;
    
    // Color logic
    let colorClass = '';
    const hasDebt = (slot.students || []).some(s => s.payment === 'debe');
    if (hasDebt) {
      colorClass = 'debt'; // Orange
    } else if (enrolledCount >= slot.capacity) {
      colorClass = 'paid'; // Blue
    } else if (enrolledCount > 0) {
      colorClass = ''; // Default green but active
    }

    return (
      <div 
        key={slot.id} draggable onDragStart={(e) => handleDragStart(e, slot)}
        onClick={() => { setSelectedSlot(slot); setShowSlotModal(true); }}
        className={`slot-absolute ${colorClass}`}
        style={{ top: `${top}px`, height: `${height}px` }}
      >
        <div className="slot-title">{slot.instrument}</div>
        <div className="slot-subtitle">{slot.time} ({slot.duration || 60}m)</div>
        <div className="slot-subtitle" style={{marginTop: 'auto'}}>{enrolledCount}/{slot.capacity} | {slot.branch === 'Remoto' ? '🌐' : '🏢'}</div>
      </div>
    );
  };

  return (
    <div className="admin-container">
      <div className="admin-header" style={{ flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => router.push('/admin')} className="back-button"><ArrowLeft size={24} color="#00DE85" /></button>
          <div><h1 className="admin-title">Agenda MPS (Fase 1)</h1><p className="admin-subtitle">Agendamiento de clases</p></div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={branchFilter} onChange={e=>setBranchFilter(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            <option value="Todas">Todas las sucursales</option><option value="Sede Principal">🏢 Sede Principal</option><option value="Remoto">🌐 Remoto</option>
          </select>
          <div className="view-toggle">
            <button className={viewMode === 'day' ? 'active' : ''} onClick={() => setViewMode('day')}>Día</button>
            <button className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>Semana</button>
          </div>
          <div className="date-navigator">
            <button className="date-nav-btn" onClick={() => changeDate(viewMode === 'week' ? -7 : -1)}><ChevronLeft size={20} /></button>
            {viewMode === 'day' ? <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: 'bold', outline: 'none' }} /> : <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Semana {weekDates[0]}</span>}
            <button className="date-nav-btn" onClick={() => changeDate(viewMode === 'week' ? 7 : 1)}><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {viewMode === 'week' && (
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Profesor en vista:</span>
            <select value={weekTeacherId} onChange={e=>setWeekTeacherId(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}

        <div className="calendar-wrapper">
          <div className="calendar-grid" style={{ gridTemplateColumns: `80px repeat(${viewMode === 'day' ? Math.max(teachers.length, 1) : 7}, minmax(180px, 1fr))` }}>
            <div className="calendar-header-row">
              <div className="calendar-header-cell calendar-time-col-header">Hora</div>
              {viewMode === 'day' ? teachers.map(t => <div key={t.id} className="calendar-header-cell">{t.name}</div>) : weekDates.map((date, i) => <div key={date} className="calendar-header-cell">{DAYS_OF_WEEK[i]}<br/><span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>{date}</span></div>)}
            </div>

            <div style={{ display: 'contents' }}>
              <div style={{ position: 'relative' }}>
                {HOURS_ARRAY.map(hour => (<div key={hour} className="calendar-time-cell" style={{ position: 'absolute', top: `${timeToPixels(hour)}px`, width: '100%', border: 'none', background: 'transparent' }}><span style={{ background: 'var(--bg-secondary)', padding: '0 4px', zIndex: 2 }}>{hour}</span></div>))}
              </div>
              {viewMode === 'day' ? teachers.map(t => (
                <div key={t.id} className="calendar-absolute-wrapper" onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, t.name)} onClick={e => handleBgClick(e, t.name)}>
                  <div className="calendar-grid-lines"></div>{displaySlots.filter(s => s.teacher === t.name).map(renderSlot)}
                </div>
              )) : weekDates.map(date => (
                <div key={date} className="calendar-absolute-wrapper" onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, date)} onClick={e => handleBgClick(e, date)}>
                  <div className="calendar-grid-lines"></div>{displaySlots.filter(s => s.date === date).map(renderSlot)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showSlotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '500px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowSlotModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            
            {selectedSlot ? (
              <>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Gestión de Cupo</h2>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <span>📅 {selectedSlot.date} | {selectedSlot.time} ({selectedSlot.duration}m)</span>
                  <span>👨‍🏫 {selectedSlot.teacher}</span>
                  <span>{getInstrumentIcon(selectedSlot.instrument)} {selectedSlot.instrument}</span>
                </div>

                {/* Fase 1: Enrolled Students */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Estudiantes Inscritos ({(selectedSlot.students||[]).length}/{selectedSlot.capacity})</h3>
                  </div>
                  
                  {(selectedSlot.students||[]).length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>No hay estudiantes registrados.</p>
                  ) : (
                    (selectedSlot.students||[]).map((st, idx) => (
                      <div key={idx} className="student-list-item">
                        <div className="student-list-header">
                          <span>{st.name}</span>
                          <button onClick={() => removeStudent(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                        <div className="student-list-controls">
                          <select value={st.status} onChange={(e) => updateStudentField(idx, 'status', e.target.value)}>
                            <option value="confirmado">Asiste</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                          <select value={st.payment} onChange={(e) => updateStudentField(idx, 'payment', e.target.value)} style={{ color: st.payment === 'debe' ? '#f97316' : '#3b82f6', fontWeight: 'bold' }}>
                            <option value="debe">Debe</option>
                            <option value="pagado">Pagado</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Add Student Control */}
                  {(selectedSlot.students||[]).length < selectedSlot.capacity && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <select value={studentToEnroll} onChange={e=>setStudentToEnroll(e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                        <option value="">Seleccionar estudiante existente...</option>
                        {studentsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <button onClick={enrollStudent} style={{ padding: '0.6rem 1rem', borderRadius: '6px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserPlus size={18}/> Agregar</button>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setShowSlotModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Aceptar</button>
                    <button onClick={() => handleDeleteSlot(selectedSlot.id)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'transparent', color: '#ef4444', fontWeight: 'bold', border: '1px solid #ef4444', cursor: 'pointer' }}>Eliminar Cupo</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Abrir Cupo</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{formDate} | {time} | {teacherName}</p>
                <form onSubmit={handleAddSlot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Hora</label>
                      <input type="time" required value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Duración (min)</label>
                      <select value={duration} onChange={e => setDuration(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                        <option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option><option value="90">90 min</option><option value="120">120 min</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Instrumento</label>
                    <select required value={instrument} onChange={e => setInstrument(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      <option value="">Selecciona...</option>
                      <option value="Piano">Piano</option><option value="Percusión">Percusión</option><option value="Vientos">Vientos</option><option value="Canto">Canto</option><option value="Cuerdas Pulsadas">Cuerdas Pulsadas</option><option value="Cuerdas Frotadas">Cuerdas Frotadas</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Sucursal</label>
                      <select required value={branch} onChange={e => setBranch(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                        <option value="Sede Principal">Sede Principal</option><option value="Remoto">Remoto</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Cupos Max</label>
                      <input type="number" min="1" required value={capacity} onChange={e => setCapacity(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                      <CalIcon size={18} color="#00DE85" /> Motor de Recurrencia
                    </label>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Repetir cada {new Date(formDate).toLocaleDateString('es-ES', {weekday: 'long'})} durante:</p>
                    <select value={recurrenceWeeks} onChange={e => setRecurrenceWeeks(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                      <option value="1">Solo este día (1 clase)</option><option value="4">1 Mes (4 clases)</option><option value="12">3 Meses (12 clases)</option><option value="24">6 Meses (24 clases)</option>
                    </select>
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#00DE85', color: '#111', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>Guardar Cupo(s)</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
