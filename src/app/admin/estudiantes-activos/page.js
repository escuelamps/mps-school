'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import '../admin.css';

export default function EstudiantesActivosPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSheetsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sheets?type=activos');
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData(json.data || []);
      }
    } catch (err) {
      setError("Error de conexión al cargar el Excel.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSheetsData();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <button className="back-button" onClick={() => router.push('/admin')}>
          <ArrowLeft size={24} />
        </button>
        <div className="header-info">
          <h1>Estudiantes Activos</h1>
          <p>Directorio y estado actual de los estudiantes.</p>
        </div>
        <button 
          onClick={fetchSheetsData} 
          disabled={loading}
          style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
          Sincronizar
        </button>
      </div>

      <div style={{ marginTop: '2rem', background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
            <p>Descargando celdas desde Google Sheets...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>
            <p><strong>Error:</strong> {error}</p>
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>El Excel está vacío o no tiene datos en esta hoja.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                  {data[0].map((header, idx) => (
                    <th key={idx} style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {data[0].map((_, colIndex) => (
                      <td key={colIndex} style={{ padding: '1rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        {row[colIndex] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
