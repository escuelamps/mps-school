'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, BarChart2, PieChart, Users, BookOpen, Calendar, Eye, Trash2, X, Plus, Clock, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import '../../admin.css';

export default function RespuestasPlanillasPage() {
  const router = useRouter();
  const [planillas, setPlanillas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de firma y detalle
  const [selectedPlanilla, setSelectedPlanilla] = useState(null);

  // Filtros de columna
  const [columnFilters, setColumnFilters] = useState({
    fecha: '',
    hora: '',
    profesor: '',
    estudiante: '',
    instrumento: '',
    contenido: ''
  });
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.username) {
          router.replace('/admin');
        }
      })
      .catch(() => router.replace('/admin'));

    const q = query(collection(db, 'planillas'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPlanillas(list);
      setLoading(false);
    }, (error) => {
      console.error('Error escuchando planillas:', error);
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este registro de planilla? Esta acción no se puede deshacer.')) {
      try {
        await deleteDoc(doc(db, 'planillas', id));
      } catch (err) {
        console.error('Error eliminando planilla:', err);
        alert('No se pudo eliminar el registro.');
      }
    }
  };

  // Métricas estadísticas
  const totalClases = planillas.length;
  
  const uniqueProfesores = Array.from(new Set(planillas.map(p => p.profesor).filter(Boolean)));
  const uniqueEstudiantes = Array.from(new Set(planillas.map(p => p.estudiante).filter(Boolean)));

  // Conteo por profesor
  const conteoProfesores = {};
  planillas.forEach(p => {
    const prof = p.profesor || 'Sin asignar';
    conteoProfesores[prof] = (conteoProfesores[prof] || 0) + 1;
  });
  const rankingProfesores = Object.entries(conteoProfesores)
    .map(([prof, count]) => ({ prof, count }))
    .sort((a, b) => b.count - a.count);

  const maxProfesorCount = rankingProfesores.length > 0 ? rankingProfesores[0].count : 1;

  // Conteo por instrumento
  const conteoInstrumentos = {};
  planillas.forEach(p => {
    const inst = p.instrumento || 'General';
    conteoInstrumentos[inst] = (conteoInstrumentos[inst] || 0) + 1;
  });
  const rankingInstrumentos = Object.entries(conteoInstrumentos)
    .map(([inst, count]) => ({ inst, count }))
    .sort((a, b) => b.count - a.count);

  const maxInstrumentoCount = rankingInstrumentos.length > 0 ? rankingInstrumentos[0].count : 1;

  // Filtrado de tabla
  const filteredPlanillas = planillas.filter(p => {
    const fecha = (p.fecha || '').toLowerCase();
    const hora = (p.hora || '').toLowerCase();
    const profesor = (p.profesor || '').toLowerCase();
    const estudiante = (p.estudiante || '').toLowerCase();
    const instrumento = (p.instrumento || '').toLowerCase();
    const contenido = (p.contenido || '').toLowerCase();

    if (columnFilters.fecha && !fecha.includes(columnFilters.fecha.toLowerCase().trim())) return false;
    if (columnFilters.hora && !hora.includes(columnFilters.hora.toLowerCase().trim())) return false;
    if (columnFilters.profesor && !profesor.includes(columnFilters.profesor.toLowerCase().trim())) return false;
    if (columnFilters.estudiante && !estudiante.includes(columnFilters.estudiante.toLowerCase().trim())) return false;
    if (columnFilters.instrumento && !instrumento.includes(columnFilters.instrumento.toLowerCase().trim())) return false;
    if (columnFilters.contenido && !contenido.includes(columnFilters.contenido.toLowerCase().trim())) return false;

    return true;
  });

  const displayedPlanillas = filteredPlanillas.slice(0, visibleCount);

  // Paleta de colores para instrumentos
  const COLORS = ['#00DE85', '#38bdf8', '#a855f7', '#f59e0b', '#ec4899', '#10b981', '#6366f1', '#eab308'];

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => router.push('/admin')} className="back-button">
            <ArrowLeft size={24} color="#00DE85" />
          </button>
          <div>
            <h1 className="admin-title">Respuestas y Firmas de Planillas</h1>
            <p className="admin-subtitle">Estadísticas pedagógicas y auditoría de clases</p>
          </div>
        </div>

        <Link
          href="/admin/planillas/registro"
          style={{
            background: "#00DE85",
            color: "#111",
            textDecoration: "none",
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <Plus size={20} /> Registrar Planilla
        </Link>
      </div>

      <div className="admin-content">
        
        {/* ================= 1. TARJETAS DE RESUMEN ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 222, 133, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00DE85' }}>
              <BarChart2 size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Clases Registradas</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 'bold' }}>{totalClases}</h3>
            </div>
          </div>

          <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Profesores con Clases</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 'bold' }}>{uniqueProfesores.length}</h3>
            </div>
          </div>

          <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Estudiantes Atendidos</p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 'bold' }}>{uniqueEstudiantes.length}</h3>
            </div>
          </div>
        </div>

        {/* ================= 2. GRÁFICOS ESTADÍSTICOS ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          {/* Gráfico 1: Clases por Profesor */}
          <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.8rem' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={20} color="#00DE85" /> Clases Dictadas por Profesor
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Volumen de asistencia registrado por docente
            </p>

            {rankingProfesores.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
                Aún no hay planillas registradas.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {rankingProfesores.map(({ prof, count }) => {
                  const pct = Math.round((count / (totalClases || 1)) * 100);
                  const barWidth = Math.max(12, Math.round((count / maxProfesorCount) * 100));
                  return (
                    <div key={prof}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{prof}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          <strong style={{ color: '#00DE85' }}>{count}</strong> {count === 1 ? 'clase' : 'clases'} ({pct}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${barWidth}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #00DE85, #2CC295)',
                            borderRadius: '5px',
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gráfico 2: Distribución por Instrumento */}
          <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.8rem' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={20} color="#38bdf8" /> Distribución por Instrumento
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Proporción de materias impartidas en el periodo
            </p>

            {rankingInstrumentos.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
                Aún no hay planillas registradas.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {rankingInstrumentos.map(({ inst, count }, idx) => {
                  const pct = Math.round((count / (totalClases || 1)) * 100);
                  const barWidth = Math.max(12, Math.round((count / maxInstrumentoCount) * 100));
                  const color = COLORS[idx % COLORS.length];
                  return (
                    <div key={inst}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                          {inst}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          <strong style={{ color }}>{count}</strong> ({pct}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${barWidth}%`,
                            height: '100%',
                            background: color,
                            borderRadius: '5px',
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ================= 3. TABLA HISTÓRICA DE RESPUESTAS ================= */}
        <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={22} color="#00DE85" /> Registro Histórico de Clases ({planillas.length})
            </h2>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Mostrando {displayedPlanillas.length} de {filteredPlanillas.length} registros
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Firma</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Fecha</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Hora</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Profesor</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Estudiante</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Instrumento</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Contenido Pedagógico</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: '#ef4444', whiteSpace: 'nowrap' }}>Eliminar</th>
                </tr>
                {/* Fila de Filtros por Columna */}
                <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '0.4rem 1rem' }}></th>
                  <th style={{ padding: '0.4rem 0.6rem' }}>
                    <input 
                      type="text" 
                      placeholder="Filtrar fecha..."
                      value={columnFilters.fecha}
                      onChange={(e) => {
                        setColumnFilters(prev => ({ ...prev, fecha: e.target.value }));
                        setVisibleCount(10);
                      }}
                      style={{
                        width: '100%',
                        minWidth: '85px',
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
                      placeholder="Hora..."
                      value={columnFilters.hora}
                      onChange={(e) => {
                        setColumnFilters(prev => ({ ...prev, hora: e.target.value }));
                        setVisibleCount(10);
                      }}
                      style={{
                        width: '100%',
                        minWidth: '70px',
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
                      placeholder="Filtrar profesor..."
                      value={columnFilters.profesor}
                      onChange={(e) => {
                        setColumnFilters(prev => ({ ...prev, profesor: e.target.value }));
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
                  <th style={{ padding: '0.4rem 0.6rem' }}>
                    <input 
                      type="text" 
                      placeholder="Filtrar estudiante..."
                      value={columnFilters.estudiante}
                      onChange={(e) => {
                        setColumnFilters(prev => ({ ...prev, estudiante: e.target.value }));
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
                      placeholder="Filtrar instrumento..."
                      value={columnFilters.instrumento}
                      onChange={(e) => {
                        setColumnFilters(prev => ({ ...prev, instrumento: e.target.value }));
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
                  <th style={{ padding: '0.4rem 0.6rem' }}>
                    <input 
                      type="text" 
                      placeholder="Filtrar contenido..."
                      value={columnFilters.contenido}
                      onChange={(e) => {
                        setColumnFilters(prev => ({ ...prev, contenido: e.target.value }));
                        setVisibleCount(10);
                      }}
                      style={{
                        width: '100%',
                        minWidth: '140px',
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
                {displayedPlanillas.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {loading ? 'Cargando planillas...' : 'No se encontraron registros con los filtros aplicados.'}
                    </td>
                  </tr>
                ) : (
                  displayedPlanillas.map((item) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Firma */}
                      <td style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>
                        {item.firma ? (
                          <div
                            onClick={() => setSelectedPlanilla(item)}
                            title="Ver firma y detalle completo"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '44px',
                              height: '28px',
                              borderRadius: '4px',
                              background: '#0d1518',
                              border: '1px solid var(--accent)',
                              cursor: 'pointer',
                              overflow: 'hidden'
                            }}
                          >
                            <img
                              src={item.firma}
                              alt="Firma"
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>-</span>
                        )}
                      </td>

                      {/* Fecha */}
                      <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {item.fecha || '-'}
                      </td>

                      {/* Hora */}
                      <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {item.hora || '-'}
                      </td>

                      {/* Profesor */}
                      <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {item.profesor || '-'}
                      </td>

                      {/* Estudiante */}
                      <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#00DE85', whiteSpace: 'nowrap' }}>
                        {item.estudiante || '-'}
                      </td>

                      {/* Instrumento */}
                      <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        <span style={{ background: 'rgba(0,222,133,0.1)', color: '#00DE85', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {item.instrumento || 'General'}
                        </span>
                      </td>

                      {/* Contenido Pedagógico */}
                      <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.contenido}>
                        {item.contenido || '-'}
                      </td>

                      {/* Eliminar */}
                      <td style={{ padding: '0.7rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Eliminar planilla"
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
                  ))
                )}
              </tbody>
            </table>

            {/* Paginación: Cargar más */}
            {filteredPlanillas.length > visibleCount && (
              <div style={{ padding: '1.2rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.01)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Mostrando {displayedPlanillas.length} de {filteredPlanillas.length} registros
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

      {/* ================= MODAL DE AUDITORÍA Y FIRMA ================= */}
      {selectedPlanilla && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <button
              onClick={() => setSelectedPlanilla(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.3rem', fontWeight: 'bold' }}>
              Auditoría de Planilla
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Detalle de asistencia y validación de firma digital
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem', background: 'var(--panel-bg)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estudiante:</span>
                <p style={{ fontWeight: 'bold', color: '#00DE85', fontSize: '0.95rem' }}>{selectedPlanilla.estudiante}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Profesor:</span>
                <p style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{selectedPlanilla.profesor}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fecha y Hora:</span>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{selectedPlanilla.fecha} ({selectedPlanilla.hora})</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Asignatura:</span>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{selectedPlanilla.instrumento}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Contenido Pedagógico:
              </span>
              <p style={{ background: 'var(--panel-bg)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto' }}>
                {selectedPlanilla.contenido}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Firma Digital del Estudiante / Acudiente:
              </span>
              <div style={{ background: '#0d1518', borderRadius: '10px', border: '1px solid var(--accent)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px' }}>
                {selectedPlanilla.firma ? (
                  <img
                    src={selectedPlanilla.firma}
                    alt="Firma Digital"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sin firma registrada</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
