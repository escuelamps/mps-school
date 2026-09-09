'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Trash2, Mail, Users, GraduationCap } from 'lucide-react';
import '../admin.css';

export default function NosotrosPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Query para profesores
    const qTeachers = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const unsubTeachers = onSnapshot(qTeachers, (snapshot) => {
      setTeachers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Query para estudiantes
    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubStudents = onSnapshot(qStudents, (snapshot) => {
      setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubTeachers();
      unsubStudents();
    };
  }, []);

  const handleDelete = async (id, roleName) => {
    if(confirm(`¿Estás seguro de eliminar el registro de este ${roleName}? (Nota: Esto no borrará su cuenta de Auth por seguridad, solo su perfil)`)) {
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
            <h1 className="admin-title">Nosotros</h1>
            <p className="admin-subtitle">Directorio general de todos los profesores y estudiantes de la escuela.</p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        
        {/* SECCIÓN DE PROFESORES */}
        <div className="panel" style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={24} color="#7e22ce" /> Profesores ({teachers.length})
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {teachers.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No hay profesores registrados.</p>
            ) : (
              teachers.map(teacher => (
                <div key={teacher.id} style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.2rem' }}>{teacher.name}</h3>
                    <p style={{ color: '#00DE85', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}><Mail size={14}/> {teacher.email}</p>
                  </div>
                  <button onClick={() => handleDelete(teacher.id, 'profesor')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECCIÓN DE ESTUDIANTES */}
        <div className="panel">
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={24} color="#3b82f6" /> Estudiantes ({students.length})
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {students.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No hay estudiantes registrados aún.</p>
            ) : (
              students.map(student => (
                <div key={student.id} style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.2rem' }}>{student.nombre} {student.apellidos}</h3>
                    <p style={{ color: '#3b82f6', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', marginBottom: '0.3rem' }}><Mail size={14}/> {student.email}</p>
                    {student.instrumento && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        🎸 {student.instrumento} {student.instrumentoComplementario ? ` / ${student.instrumentoComplementario}` : ''}
                      </p>
                    )}
                    {student.paqueteHoras && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        ⏱️ {student.paqueteHoras}
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(student.id, 'estudiante')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
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
