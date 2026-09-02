import React from 'react';

export default function SemipersonalizadoPage() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <h1 style={{ color: 'var(--accent-primary)', fontSize: '2.5rem', marginBottom: '20px' }}>
        Curso Libre Semipersonalizado
      </h1>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '30px' }}>
        Desarrolla tus habilidades musicales en un entorno colaborativo. Nuestro programa semipersonalizado 
        ofrece atención detallada en grupos pequeños, garantizando un aprendizaje dinámico y efectivo.
      </p>

      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>Detalles del Programa</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>⏳ <strong>Duración:</strong> 16 semanas (32 horas totales)</li>
          <li style={{ padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>👥 <strong>Capacidad:</strong> Máximo 5 estudiantes por grupo</li>
          <li style={{ padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>💰 <strong>Inversión:</strong> $230,000 COP mensuales</li>
        </ul>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>Instrumentos Disponibles</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['Piano', 'Percusión', 'Vientos', 'Canto', 'Cuerdas Pulsadas', 'Cuerdas Frotadas'].map(inst => (
            <span key={inst} style={{ background: 'var(--accent-primary)', color: '#000F11', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
              {inst}
            </span>
          ))}
        </div>
      </div>

      <div style={{ background: '#ef444420', border: '1px solid #ef4444', padding: '20px', borderRadius: '12px' }}>
        <h3 style={{ color: '#ef4444', marginTop: 0 }}>⚠️ Política de Asistencia</h3>
        <p style={{ margin: 0, color: 'var(--text-primary)' }}>
          Por la naturaleza grupal de este formato, <strong>no se realizan reposiciones de clases</strong> por inasistencia del estudiante bajo ninguna circunstancia.
        </p>
      </div>
    </div>
  );
}
