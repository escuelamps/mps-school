'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, ExternalLink, Copy, Check, Search, Calendar, Award, Users, RefreshCw, Loader2 } from 'lucide-react';
import '../admin.css';

export default function AdminClassroomPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchClassroomData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/classroom');
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Error fetching classroom courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.username) {
          router.replace('/admin');
        }
      })
      .catch(() => router.replace('/admin'));

    fetchClassroomData();
  }, [router]);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCourses = courses.filter(c => {
    const text = `${c.name || ''} ${c.section || ''} ${c.teacher || ''} ${c.descriptionHeading || ''}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase().trim());
  });

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => router.push('/admin')} className="back-button">
            <ArrowLeft size={24} color="#00DE85" />
          </button>
          <div>
            <h1 className="admin-title">Google Classroom (Procesos)</h1>
            <p className="admin-subtitle">Aulas virtuales, tareas asignadas y códigos de acceso</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={fetchClassroomData}
            disabled={loading}
            style={{
              background: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--glass-border)',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Sincronizar
          </button>

          <a
            href="https://classroom.google.com/h/tv"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#00DE85',
              color: '#111',
              textDecoration: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            <BookOpen size={18} /> Abrir Classroom Oficial <ExternalLink size={15} />
          </a>
        </div>
      </div>

      <div className="admin-content">
        
        {/* Barra de Búsqueda */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar curso, instrumento o profesor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.4rem',
                borderRadius: '8px',
                background: 'var(--panel-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--glass-border)',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {filteredCourses.length} {filteredCourses.length === 1 ? 'aula activa' : 'aulas activas'}
          </span>
        </div>

        {/* Listado de Cursos */}
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
            <p>Conectando con Google Classroom...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
            <p>No se encontraron aulas con el término de búsqueda.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px',
                  padding: '1.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.2rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <span style={{ background: 'rgba(0, 222, 133, 0.1)', color: '#00DE85', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {course.section || 'Aula General'}
                    </span>
                    {course.enrollmentCode && (
                      <button
                        onClick={() => handleCopyCode(course.enrollmentCode)}
                        title="Copiar código de clase"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--glass-border)',
                          color: copiedCode === course.enrollmentCode ? '#00DE85' : 'var(--text-primary)',
                          borderRadius: '6px',
                          padding: '0.3rem 0.6rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {copiedCode === course.enrollmentCode ? <Check size={12} /> : <Copy size={12} />}
                        {course.enrollmentCode}
                      </button>
                    )}
                  </div>

                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '0.4rem', fontWeight: 'bold' }}>
                    {course.name}
                  </h3>

                  {course.descriptionHeading && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.8rem', lineHeight: 1.4 }}>
                      {course.descriptionHeading}
                    </p>
                  )}

                  {course.teacher && (
                    <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Users size={14} /> Docente: {course.teacher}
                    </p>
                  )}
                </div>

                {/* Tareas del Curso */}
                {course.courseWork && course.courseWork.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
                      Tareas y Actividades ({course.courseWork.length})
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {course.courseWork.slice(0, 3).map((cw) => (
                        <div key={cw.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                            • {cw.title}
                          </span>
                          {cw.dueDate && (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                              {cw.dueDate.day}/{cw.dueDate.month}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.8rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <a
                    href={course.alternateLink || 'https://classroom.google.com/h/tv'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'transparent',
                      color: 'var(--accent)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    Ir a esta aula <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
