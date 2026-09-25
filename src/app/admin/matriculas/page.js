'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, RefreshCw, Edit2, X, Save } from 'lucide-react';
import '../admin.css';





export default function MatriculasPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [editingRow, setEditingRow] = useState(null);
  const [editValues, setEditValues] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);

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
          type: 'matriculas',
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
      const res = await fetch('/api/sheets?type=matriculas');
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
          <h1>Base de Matrículas</h1>
          <p>Consolidado y registro oficial de matrículas.</p>
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
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>Acciones</th>
                  {data[0].map((header, idx) => (
                    <th key={idx} style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(1).map((row, rowIndex) => {
                  const actualIndex = rowIndex + 1; // Para coincidir con data[]
                  return (
                    <tr key={rowIndex} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.3s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => handleEditClick(actualIndex)} style={{ background: 'var(--accent)', color: 'black', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Edit2 size={16} />
                        </button>
                      </td>
                      {data[0].map((_, colIndex) => (
                        <td key={colIndex} style={{ padding: '1rem', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                          {row[colIndex] || '-'}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>

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
