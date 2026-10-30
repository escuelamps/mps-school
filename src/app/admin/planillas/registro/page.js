'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, RotateCcw, Send, Calendar, Clock, BookOpen, User, GraduationCap, FileText, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default function RegistroPlanillaPage() {
  const router = useRouter();
  const canvasRef = useRef(null);

  // Form State
  const [profesor, setProfesor] = useState('');
  const [estudiante, setEstudiante] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [instrumento, setInstrumento] = useState('');
  const [contenido, setContenido] = useState('');

  // Data lists
  const [profesoresList, setProfesoresList] = useState([]);
  const [estudiantesList, setEstudiantesList] = useState([]);
  const [estudianteBusqueda, setEstudianteBusqueda] = useState('');
  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState([]);
  const [mostrarDropdownEstudiante, setMostrarDropdownEstudiante] = useState(false);

  // Signature state
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Instruments list
  const INSTRUMENTOS_OPTIONS = [
    'Piano',
    'Canto',
    'Técnica Vocal',
    'Violín',
    'Guitarra Eléctrica',
    'Guitarra Acústica',
    'Bajo Eléctrico',
    'Batería',
    'Iniciación Musical',
    'Producción Musical',
    'Ukelele',
    'Teoría Musical',
    'Ensamble / Banda',
    'Otro'
  ];

  // Load teachers and students
  useEffect(() => {
    let loggedTeacherName = '';

    // Helper to resolve teacher name from session
    const getTeacherNameFromSession = (u) => {
      if (!u || !u.username) return '';
      const uLower = u.username.toLowerCase();
      const eLower = (u.email || '').toLowerCase();
      if (uLower === 'lpineda' || eLower === 'lpineda@escuelamps.com') return 'Laura Pineda';
      if (uLower === 'william' || eLower === 'william@escuelamps.com') return 'William Buitrago';
      if (uLower === 'juanse' || eLower === 'juanse@escuelamps.com') return 'Juan Sebastián';
      return u.name || u.username;
    };

    // 1. Check user auth & pre-select
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(userData => {
        if (userData && userData.username) {
          loggedTeacherName = getTeacherNameFromSession(userData);
          if (loggedTeacherName) {
            setProfesor(loggedTeacherName);
          }
        }
      })
      .catch(() => {});

    // 2. Load teachers from Firestore + Base Docente
    const fetchTeachers = async () => {
      try {
        const teachersMap = new Map();
        
        // Profesores base del cuerpo docente de MPS
        const DEFAULT_TEACHERS = [
          'Laura Pineda',
          'William Buitrago',
          'Jorge Garcia',
          'Sebastian Vergara',
          'Andres Bernal',
          'Carlos Macia',
          'Jenny Rojas',
          'Laura Mendoza',
          'Luisa Medellin',
          'Sahar Abwmar',
          'Shalom Prieto'
        ];
        DEFAULT_TEACHERS.forEach(tName => {
          teachersMap.set(tName.toLowerCase(), { id: tName, name: tName });
        });

        // Complementar con usuarios de Firestore
        const q = query(collection(db, 'users'), where('role', 'in', ['teacher', 'admin']));
        const snap = await getDocs(q);
        snap.docs.forEach(doc => {
          const d = doc.data();
          let name = d.name;
          if (!name || !name.trim()) {
            if (d.email === 'lpineda@escuelamps.com' || d.username === 'lpineda') name = 'Laura Pineda';
            else if (d.email === 'william@escuelamps.com' || d.username === 'william') name = 'William Buitrago';
            else name = d.username || 'Profesor';
          }
          if (name && name.trim()) {
            teachersMap.set(name.trim().toLowerCase(), { id: doc.id, name: name.trim() });
          }
        });

        const list = Array.from(teachersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        setProfesoresList(list);

        // Preselección automática si está logueado
        if (loggedTeacherName) {
          const match = list.find(t => t.name.toLowerCase() === loggedTeacherName.toLowerCase());
          if (match) {
            setProfesor(match.name);
          } else {
            setProfesor(loggedTeacherName);
          }
        } else if (list.length > 0 && !profesor) {
          setProfesor(list[0].name);
        }
      } catch (e) {
        console.error('Error fetching teachers:', e);
      }
    };

    // 3. Load students from Sheets Activos + Firestore
    const fetchStudents = async () => {
      const namesSet = new Set();
      try {
        const res = await fetch('/api/sheets?type=activos');
        const json = await res.json();
        if (json.data && json.data.length > 1) {
          // Row 0 is headers, find student name column
          const headers = json.data[0];
          let nameIdx = headers.findIndex(h => /estudiante|nombre|alumno/i.test(h));
          if (nameIdx === -1) nameIdx = 0; // default to first col if not found

          json.data.slice(1).forEach(row => {
            const studentName = row[nameIdx];
            if (studentName && typeof studentName === 'string' && studentName.trim()) {
              namesSet.add(studentName.trim());
            }
          });
        }
      } catch (err) {
        console.error('Error loading sheets students:', err);
      }

      try {
        const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
        const snap = await getDocs(qStudents);
        snap.docs.forEach(d => {
          const s = d.data();
          const sName = s.nombre || s.name || s.username;
          if (sName && sName.trim()) namesSet.add(sName.trim());
        });
      } catch (err) {
        console.error('Error loading firestore students:', err);
      }

      const sortedList = Array.from(namesSet).sort((a, b) => a.localeCompare(b));
      setEstudiantesList(sortedList);
      setEstudiantesFiltrados(sortedList.slice(0, 30));
    };

    fetchTeachers();
    fetchStudents();
  }, []);

  // Filter students on input change
  const handleEstudianteSearch = (val) => {
    setEstudianteBusqueda(val);
    setEstudiante(val);
    if (!val.trim()) {
      setEstudiantesFiltrados(estudiantesList.slice(0, 30));
    } else {
      const lower = val.toLowerCase();
      setEstudiantesFiltrados(
        estudiantesList.filter(s => s.toLowerCase().includes(lower)).slice(0, 30)
      );
    }
    setMostrarDropdownEstudiante(true);
  };

  const handleSelectEstudiante = (name) => {
    setEstudiante(name);
    setEstudianteBusqueda(name);
    setMostrarDropdownEstudiante(false);
  };

  // Canvas drawing logic
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (e.type === 'touchstart') e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.type === 'touchmove') e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#00DE85';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = (e) => {
    if (e.type === 'touchend') e.preventDefault();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!profesor.trim()) {
      setErrorMsg('Por favor selecciona el profesor.');
      return;
    }
    if (!estudiante.trim()) {
      setErrorMsg('Por favor indica el nombre del estudiante.');
      return;
    }
    if (!instrumento.trim()) {
      setErrorMsg('Por favor selecciona la asignatura o instrumento.');
      return;
    }
    if (!contenido.trim()) {
      setErrorMsg('Por favor escribe el contenido pedagógico de la clase.');
      return;
    }
    if (!hasSignature) {
      setErrorMsg('La firma digital del estudiante o acudiente es obligatoria.');
      return;
    }

    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const firmaUrl = canvas ? canvas.toDataURL('image/png') : '';

      await addDoc(collection(db, 'planillas'), {
        profesor: profesor.trim(),
        estudiante: estudiante.trim(),
        fecha,
        hora,
        instrumento: instrumento.trim(),
        contenido: contenido.trim(),
        firma: firmaUrl,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
    } catch (err) {
      console.error('Error guardando planilla:', err);
      setErrorMsg('Error al guardar la planilla. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setSuccess(false);
    setEstudiante('');
    setEstudianteBusqueda('');
    setContenido('');
    clearSignature();
  };

  const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: '0.95rem'
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: 'var(--accent)',
    fontWeight: 600
  };

  if (success) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)', padding: '2rem' }}>
        <div style={{ maxWidth: '540px', width: '100%', textAlign: 'center', padding: '3rem 2rem', background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(0, 222, 133, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <CheckCircle2 size={44} color="var(--accent)" />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.8rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>¡Planilla Registrada!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: 1.5 }}>
            La clase con <strong style={{ color: 'var(--text-primary)' }}>{estudiante}</strong> dictada por <strong style={{ color: 'var(--text-primary)' }}>{profesor}</strong> ({instrumento}) fue registrada con su firma correspondiente.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleResetForm}
              style={{
                background: 'var(--accent)',
                color: '#111',
                padding: '0.8rem 1.6rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Registrar otra planilla
            </button>
            <button
              onClick={() => router.push('/admin/planillas/respuestas')}
              style={{
                background: 'transparent',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                padding: '0.8rem 1.6rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Ver respuestas y gráficos
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)', padding: '2rem' }}>
      <style dangerouslySetInnerHTML={{__html: `
        select option {
          background-color: #111;
          color: white;
        }
      `}} />

      <Link 
        href="/admin" 
        style={{ 
          position: 'absolute', 
          top: '2rem', 
          left: '2rem', 
          color: 'var(--text-secondary)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          textDecoration: 'none',
          fontSize: '0.95rem',
          fontWeight: 600
        }}
      >
        <ArrowLeft size={20} /> Volver al Dashboard
      </Link>

      <div style={{ maxWidth: '720px', width: '100%', padding: '2.5rem', background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', marginTop: '2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Registro de Planilla Docente
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Control pedagógico de asistencia y firma digital de clase
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.8rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          
          {/* Fila 1: Docente y Estudiante */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
            <div>
              <label style={labelStyle}>
                <User size={16} /> Profesor *
              </label>
              <select
                value={profesor}
                onChange={(e) => setProfesor(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">-- Selecciona el profesor --</option>
                {profesoresList.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <label style={labelStyle}>
                <GraduationCap size={16} /> Estudiante *
              </label>
              <input
                type="text"
                placeholder="Escribe o busca el nombre..."
                value={estudianteBusqueda}
                onChange={(e) => handleEstudianteSearch(e.target.value)}
                onFocus={() => setMostrarDropdownEstudiante(true)}
                style={inputStyle}
                required
              />
              {mostrarDropdownEstudiante && estudiantesFiltrados.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '180px',
                  overflowY: 'auto',
                  background: '#182228',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  zIndex: 20,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  marginTop: '4px'
                }}>
                  {estudiantesFiltrados.map((sName, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectEstudiante(sName)}
                      style={{
                        padding: '0.6rem 1rem',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 222, 133, 0.15)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {sName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fila 2: Fecha, Hora y Asignatura */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem' }}>
            <div>
              <label style={labelStyle}>
                <Calendar size={16} /> Fecha de la Clase *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>
                <Clock size={16} /> Hora *
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>
                <BookOpen size={16} /> Asignatura / Instrumento *
              </label>
              <select
                value={instrumento}
                onChange={(e) => setInstrumento(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">-- Selecciona instrumento --</option>
                {INSTRUMENTOS_OPTIONS.map((inst, idx) => (
                  <option key={idx} value={inst}>{inst}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 3: Contenido Pedagógico */}
          <div>
            <label style={labelStyle}>
              <FileText size={16} /> Contenido Pedagógico / Temas vistos *
            </label>
            <textarea
              rows={4}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Describe las obras, escalas, técnicas, repertorio y observaciones vistas durante la sesión..."
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: 1.5
              }}
              required
            />
          </div>

          {/* Fila 4: Lienzo de Firma Digital */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={labelStyle}>
                Firma Digital del Estudiante / Acudiente *
              </label>
              <button
                type="button"
                onClick={clearSignature}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <RotateCcw size={14} /> Limpiar firma
              </button>
            </div>
            
            <div style={{
              background: '#0d1518',
              borderRadius: '8px',
              border: `1px dashed ${hasSignature ? 'var(--accent)' : 'rgba(255,255,255,0.2)'}`,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <canvas
                ref={canvasRef}
                width={660}
                height={160}
                style={{
                  width: '100%',
                  height: '160px',
                  display: 'block',
                  cursor: 'crosshair',
                  touchAction: 'none'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasSignature && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.85rem'
                }}>
                  Firma aquí con el dedo o mouse
                </div>
              )}
            </div>
          </div>

          {/* Botón Enviar */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.1rem',
              borderRadius: '8px',
              background: 'var(--accent)',
              color: '#111',
              fontWeight: 'bold',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              marginTop: '1rem',
              transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Guardando planilla...
              </>
            ) : (
              <>
                <Send size={18} /> Guardar y Enviar Planilla
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
