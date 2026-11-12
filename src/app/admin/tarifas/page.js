'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, Save, RotateCcw, CheckCircle, ShieldCheck } from 'lucide-react';
import { OFFICIAL_TARIFAS_DEFAULT, formatCOP } from '@/data/programs';
import '../admin.css';

export default function TarifasAdminPage() {
  const router = useRouter();
  const [tarifas, setTarifas] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionUser, setSessionUser] = useState(null);

  // Verificar sesión administrativa
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.username) {
          router.replace('/admin');
        } else {
          setSessionUser(data);
        }
      })
      .catch(() => router.replace('/admin'));
  }, [router]);

  // Suscribirse a la colección 'tarifas' en Firestore
  useEffect(() => {
    const colRef = collection(db, 'tarifas');
    const unsub = onSnapshot(colRef, async (snapshot) => {
      if (snapshot.empty) {
        // Auto-inicializar con las tarifas oficiales de los volantes si está vacía
        const initial = {};
        for (const [key, val] of Object.entries(OFFICIAL_TARIFAS_DEFAULT)) {
          await setDoc(doc(db, 'tarifas', key), val);
          initial[key] = val;
        }
        setTarifas(initial);
      } else {
        const loaded = {};
        snapshot.forEach((d) => {
          loaded[d.id] = { id: d.id, ...d.data() };
        });
        setTarifas(loaded);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error al cargar tarifas de Firestore:', err);
      // Fallback a los valores oficiales en memoria
      setTarifas(OFFICIAL_TARIFAS_DEFAULT);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handlePriceChange = (id, newPrice) => {
    const num = parseInt(newPrice.toString().replace(/\D/g, ''), 10) || 0;
    setTarifas(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        precio: num
      }
    }));
  };

  const handleSaveTarifa = async (id) => {
    const item = tarifas[id];
    if (!item) return;

    setSavingId(id);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await setDoc(doc(db, 'tarifas', id), {
        ...item,
        actualizadoPor: sessionUser?.username || sessionUser?.cargo || 'administracion',
        actualizadoEn: new Date().toISOString()
      }, { merge: true });

      setSuccessMsg(`Tarifa "${item.name}" actualizada a ${formatCOP(item.precio)} con éxito.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error al guardar tarifa:', err);
      setErrorMsg('No se pudo guardar la tarifa: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('¿Deseas restaurar todas las tarifas a los valores oficiales de los volantes?')) return;
    setLoading(true);
    try {
      for (const [key, val] of Object.entries(OFFICIAL_TARIFAS_DEFAULT)) {
        await setDoc(doc(db, 'tarifas', key), {
          ...val,
          actualizadoPor: sessionUser?.username || 'reset_oficial',
          actualizadoEn: new Date().toISOString()
        });
      }
      setSuccessMsg('Todas las tarifas fueron restauradas a los valores oficiales.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Error al restaurar tarifas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const categorias = [
    {
      titulo: '🏢 Clases Individuales en Sede (MPS One)',
      desc: 'Clases 100% personalizadas según tu nivel y objetivo en instalaciones MPS.',
      ids: ['individual_sede_4', 'individual_sede_8', 'individual_sede_12']
    },
    {
      titulo: '🏠 Clases Individuales a Domicilio (MPS One)',
      desc: 'Clases personalizadas en la residencia del estudiante con docente MPS.',
      ids: ['individual_domicilio_4', 'individual_domicilio_8', 'individual_domicilio_12']
    },
    {
      titulo: '👥 Clases Grupales Semipersonalizadas (MPS Link)',
      desc: '1.5 hrs/semana en grupos reducidos, 6 cátedras de instrumentos y concierto de cierre.',
      ids: ['grupal_semipersonalizado_mes', 'grupal_semipersonalizado_trimestre']
    },
    {
      titulo: '🎭 Talleres de Temporada y Cursos Especiales',
      desc: 'Programas especializados y talleres trimestrales de artes escénicas.',
      ids: ['taller_actuacion_trimestre']
    },
    {
      titulo: '📋 Matrícula Anual Institucional',
      desc: 'Valor de matrícula aplicable a cada compra (estudiantes nuevos o renovación anual).',
      ids: ['matricula_institucional']
    }
  ];

  return (
    <div className="admin-container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button 
          onClick={() => router.push('/admin')}
          className="admin-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} /> Volver al Panel
        </button>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.82rem', background: '#e0f2fe', color: '#0369a1', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} /> Gestión Oficial de Costos y Tarifas MPS
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#000F11', margin: '0 0 0.5rem 0' }}>
          Gestión de Tarifas y Precios
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Modifica cualquier valor aquí. Los cambios se sincronizan en <strong>tiempo real</strong> en el formulario de Checkout web y en la aplicación móvil de MPS.
        </p>
      </div>

      {/* MENSAJES */}
      {successMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.85rem 1.2rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.85rem 1.2rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
          <p>Cargando tarifas oficiales desde Firestore...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {categorias.map(cat => (
            <div key={cat.titulo} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.6rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ marginBottom: '1.2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#000F11', margin: '0 0 0.25rem 0' }}>
                  {cat.titulo}
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                  {cat.desc}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
                {cat.ids.map(id => {
                  const item = tarifas[id] || OFFICIAL_TARIFAS_DEFAULT[id];
                  if (!item) return null;
                  const isSaving = savingId === id;

                  return (
                    <div 
                      key={id}
                      style={{ 
                        background: '#f8fafc', 
                        border: '1.5px solid #e2e8f0', 
                        borderRadius: '12px', 
                        padding: '1.2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                            {item.name}
                          </h3>
                          <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 600, color: '#334155' }}>
                            {item.clases ? `${item.clases} clases` : 'Mensual'}
                          </span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '1rem', minHeight: '34px' }}>
                          {item.descripcion}
                        </p>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                          Precio Oficial (COP)
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>$</span>
                            <input 
                              type="number"
                              value={item.precio || ''}
                              onChange={(e) => handlePriceChange(id, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.6rem 0.6rem 0.6rem 1.6rem',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '1.05rem',
                                fontWeight: 700,
                                color: '#09624C',
                                background: '#ffffff',
                                outline: 'none'
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSaveTarifa(id)}
                            disabled={isSaving}
                            style={{
                              background: '#09624C',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.65rem 0.9rem',
                              cursor: isSaving ? 'not-allowed' : 'pointer',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              transition: 'background 0.2s'
                            }}
                          >
                            <Save size={15} /> {isSaving ? 'Guardando...' : 'Guardar'}
                          </button>
                        </div>
                        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748b' }}>
                          Vista previa: <strong style={{ color: '#0f172a' }}>{formatCOP(item.precio)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* BOTÓN RESTAURAR POR DEFECTO */}
          <div style={{ textAlign: 'center', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <button
              type="button"
              onClick={handleResetToDefault}
              style={{
                background: 'transparent',
                border: '1px solid #cbd5e1',
                color: '#64748b',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <RotateCcw size={14} /> Restaurar todos los precios a valores oficiales de volante
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
