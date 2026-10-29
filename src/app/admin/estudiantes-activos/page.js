'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, RefreshCw, Edit2, X, Save } from 'lucide-react';
import '../admin.css';





export default function EstudiantesActivosPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [editingRow, setEditingRow] = useState(null);
  const [editValues, setEditValues] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [columnFilters, setColumnFilters] = useState({});
  const [visibleCount, setVisibleCount] = useState(10);

  const handleEditClick = (rowIndex) => {
    setEditingRow(rowIndex);
    setEditValues([...data[rowIndex]]);
    setEditError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setEditError(null);
    try {
      // data[0] is headers, data[1] is row 2 in Excel. So rowNumber = editingRow + 1
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'activos',
          rowNumber: editingRow + 1,
          values: editValues
        })
      });
      const json = await res.json();
      if (json.error) {
        setEditError(json.error);
      } else {
        const newData = [...data];
        newData[editingRow] = editValues;
        setData(newData);
        setEditingRow(null);
      }
    } catch (err) {
      setEditError("Error de conexión al guardar.");
    }
    setIsSaving(false);
  };

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
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.username || data.username === 'juanse') {
          router.replace('/admin');
        }
      })
      .catch(() => router.replace('/admin'));

    fetchSheetsData();
  }, [router]);

  const filteredRows = (data.length > 1 ? data.slice(1) : []).map((row, index) => ({
    row,
    actualIndex: index + 1
  })).filter(({ row }) => {
    for (const [colIdxStr, filterVal] of Object.entries(columnFilters)) {
      if (!filterVal || !filterVal.trim()) continue;
      const colIdx = parseInt(colIdxStr, 10);
      const cellVal = (row[colIdx] || '').toString().toLowerCase();
      if (!cellVal.includes(filterVal.toLowerCase().trim())) {
        return false;
      }
    }
    return true;
  });

  const displayedRows = filteredRows.slice(0, visibleCount);

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
            <p>Actualizando...</p>
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
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Editar</th>
                  {data[0].map((header, idx) => (
                    <th key={idx} style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                      {header}
                    </th>
                  ))}
                </tr>
                {/* Fila de Filtros por Columna */}
                <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '0.4rem 1rem' }}></th>
                  {data[0].map((header, idx) => (
                    <th key={idx} style={{ padding: '0.4rem 0.6rem' }}>
                      <input 
                        type="text" 
                        placeholder={`Filtrar...`}
                        value={columnFilters[idx] || ''}
                        onChange={(e) => {
                          setColumnFilters(prev => ({ ...prev, [idx]: e.target.value }));
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
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedRows.length === 0 ? (
                  <tr>
                    <td colSpan={data[0].length + 1} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      No se encontraron estudiantes con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  displayedRows.map(({ row, actualIndex }) => (
                    <tr key={actualIndex} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.7rem 1rem' }}>
                        <button onClick={() => handleEditClick(actualIndex)} title="Editar registro" style={{ background: 'var(--accent)', color: 'black', border: 'none', padding: '0.35rem 0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}>
                          <Edit2 size={13} /> Editar
                        </button>
                      </td>
                      {data[0].map((_, colIndex) => (
                        <td key={colIndex} style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {row[colIndex] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Paginación: Botón Cargar Más */}
            {filteredRows.length > visibleCount && (
              <div style={{ padding: '1.2rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.01)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Mostrando {displayedRows.length} de {filteredRows.length} estudiantes
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
        )}
      </div>

      {editingRow !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'white', margin: 0 }}>Editar Registro</h2>
              <button onClick={() => setEditingRow(null)} disabled={isSaving} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {editError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  {editError}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data[0].map((header, idx) => (
                  <div key={idx}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{header}</label>
                    <input 
                      type="text"
                      value={editValues[idx] || ''}
                      onChange={(e) => {
                        const newVals = [...editValues];
                        newVals[idx] = e.target.value;
                        setEditValues(newVals);
                      }}
                      style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setEditingRow(null)} disabled={isSaving} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={isSaving} style={{ background: 'var(--accent)', color: 'black', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
