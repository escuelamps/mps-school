"use client";
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Upload, Utensils, Coffee, Wine, Beer, Pizza, GlassWater } from 'lucide-react';
import Link from 'next/link';

const OPCIONES_MENU = [
  { id: 'todo_rico', label: 'Todo rico', price: 3500, icon: <Utensils size={20} /> },
  { id: 'papas_margaritas', label: 'Papas Margaritas', price: 3500, icon: <Utensils size={20} /> },
  { id: 'paquetes_surtidos', label: 'Paquetes surtidos', price: 3000, icon: <Utensils size={20} /> },
  { id: 'gaseosa_postobon', label: 'Gaseosa Postobon', price: 3500, icon: <GlassWater size={20} /> },
  { id: 'coca_cola', label: 'Coca cola', price: 3000, icon: <GlassWater size={20} /> },
  { id: 'cuatro', label: 'Cuatro', price: 3000, icon: <GlassWater size={20} /> },
  { id: 'pony_malta', label: 'Pony Malta', price: 3000, icon: <GlassWater size={20} /> },
  { id: 'agua_cristal', label: 'Agua Cristal', price: 2000, icon: <GlassWater size={20} /> },
  { id: 'cerveza_club', label: 'Cerveza Club Colombia', price: 5000, icon: <Beer size={20} /> },
  { id: 'cerveza_aguila', label: 'Cerveza Aguila', price: 5000, icon: <Beer size={20} /> },
  { id: 'hamburguesa_sola', label: 'Hamburguesa Sola', price: 12000, icon: <Pizza size={20} />, image: '/images/mps-sin-papa.jpeg' },
  { id: 'hamburguesa_combo_gaseosa', label: 'Hamburguesa Combo (+ Gaseosa)', price: 15000, icon: <Pizza size={20} />, image: '/images/mps-hamburguesa.jpeg' },
  { id: 'hamburguesa_combo_cerveza', label: 'Hamburguesa Combo (+ Cerveza)', price: 18000, icon: <Pizza size={20} />, image: '/images/mps-hamburguesa.jpeg' },
];

export default function CenaPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    mesa: '',
    opcionesCantidades: {},
    comprobante: null,
    pagoEfectivo: false,
  });
  
  const [errors, setErrors] = useState({});

  const handleFileChange = (e, field = 'comprobante') => {
    const file = e.target.files[0];
    if (file && file.size > 15 * 1024 * 1024) {
      alert(`El archivo es demasiado grande. El tamaño máximo es 15 MB.`);
      e.target.value = null;
      setFormData(prev => ({ ...prev, [field]: null }));
    } else {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleQuantityChange = (id, delta) => {
    setFormData(prev => {
      const currentQty = prev.opcionesCantidades[id] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const newCantidades = { ...prev.opcionesCantidades };
      
      if (newQty === 0) {
        delete newCantidades[id];
      } else {
        newCantidades[id] = newQty;
      }
      
      if (errors.opcionesCantidades && Object.keys(newCantidades).length > 0) {
        setErrors(e => ({...e, opcionesCantidades: ''}));
      }
      
      return { ...prev, opcionesCantidades: newCantidades };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Requerido.';
    if (!formData.telefono.trim()) newErrors.telefono = 'Requerido.';
    
    if (!formData.mesa.trim()) {
      newErrors.mesa = 'Requerido.';
    } else if (isNaN(Number(formData.mesa))) {
      newErrors.mesa = 'Debe ser un número.';
    }

    if (Object.keys(formData.opcionesCantidades).length === 0) {
      newErrors.opcionesCantidades = 'Selecciona al menos una opción.';
    }
    
    // NOTA: El comprobante ya no es obligatorio, por lo tanto quitamos la validación
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setShowConfirmModal(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setShowConfirmModal(false);
      try {
        let comprobanteUrl = '';
        
        const seleccionTexto = Object.entries(formData.opcionesCantidades).map(([id, qty]) => {
          const label = OPCIONES_MENU.find(opt => opt.id === id).label;
          return `${qty}x ${label}`;
        }).join(', ');

        // 1. LÓGICA DE FIREBASE (Para el tiempo real del Panel)
        const { db } = await import('@/lib/firebase');
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

        if (formData.comprobante) {
          comprobanteUrl = 'excel';
        }

        await addDoc(collection(db, 'cenas'), {
          nombre: formData.nombre,
          telefono: formData.telefono,
          mesa: formData.mesa,
          opcionCena: seleccionTexto,
          comprobanteUrl: comprobanteUrl,
          pagoEfectivo: formData.pagoEfectivo,
          total: total,
          estado: formData.pagoEfectivo ? 'Efectivo (Pendiente)' : (comprobanteUrl ? 'Pendiente' : 'Sin Pago'),
          createdAt: serverTimestamp()
        });

        // 2. LÓGICA DE GOOGLE SHEETS (Para el Excel de la escuela)
        const payload = {
          sheetName: 'Cena',
          headers: ["Fecha", "Nombre", "Teléfono", "Mesa", "Opción", "Total", "Pago en efectivo", "Recibo"],
          rowData: [
            formData.nombre,
            formData.telefono,
            formData.mesa || "Sin mesa",
            seleccionTexto,
            total,
            formData.pagoEfectivo ? "Sí" : "No",
            formData.comprobante ? "{FILE_URL}" : "Sin comprobante"
          ]
        };

        if (formData.comprobante) {
          payload.fileData = await getBase64(formData.comprobante);
          payload.fileName = formData.comprobante.name;
          payload.mimeType = formData.comprobante.type;
        }

        await fetch("https://script.google.com/macros/s/AKfycbzqOhXUSTkyBEjaa481vTtA6HbaFOVqAVQiko3bGOePdtU6dL7MaK1-Op6WnW9Shes1Tg/exec", {
          method: "POST",
          body: JSON.stringify(payload),
          mode: "no-cors"
        });
        
        setSuccess(true);
      } catch (err) {
        console.error("Error al guardar:", err);
        alert("Hubo un problema: " + err.message);
      } finally {
        setLoading(false);
      }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  // Calcular el total
  const total = Object.entries(formData.opcionesCantidades).reduce((sum, [id, qty]) => {
    const option = OPCIONES_MENU.find(o => o.id === id);
    return sum + (option ? option.price * qty : 0);
  }, 0);

  if (success) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem' }}>
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(0, 222, 133, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
            <CheckCircle2 size={40} color="var(--accent)" />
          </div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>¡Pedido Exitoso!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Hemos recibido tu pedido. En breve lo llevaremos a tu mesa.
          </p>
          <a href="/cena" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Hacer otro pedido
          </a>
        </div>
      </main>
    );
  }

  const inputStyle = (name) => ({
    width: '100%', padding: '0.8rem', borderRadius: '8px', 
    background: 'var(--panel-bg)', 
    border: `1px solid ${errors[name] ? '#ff6961' : 'var(--glass-border)'}`, 
    color: 'var(--text-primary)', outline: 'none'
  });
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600' };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)', padding: '2rem 5% 6rem 5%', position: 'relative' }}>
      <Link href="/" style={{ position: 'absolute', top: '2rem', left: '2rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <ArrowLeft size={20} /> Volver
      </Link>

      <div style={{ maxWidth: '1100px', margin: '4rem auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,222,133,0.1)', color: 'var(--accent)', padding: '0.5rem 1rem', borderRadius: '20px', marginBottom: '1rem', fontWeight: 'bold' }}>
            <Utensils size={18} /> Menú del Evento
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', lineHeight: '1.1', marginBottom: '1.5rem' }}>
            Haz tu pedido
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2.5rem' }}>
            Selecciona cada una de las opciones que deseas disfrutar hoy:
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '800px' }}>
          <form onSubmit={handlePreSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Opciones en cajas */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {OPCIONES_MENU.map(opcion => {
                  const qty = formData.opcionesCantidades[opcion.id] || 0;
                  const isSelected = qty > 0;
                  return (
                    <div key={opcion.id} style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem', padding: '1rem', 
                      background: isSelected ? 'rgba(0, 222, 133, 0.1)' : 'var(--panel-bg)', 
                      borderRadius: '12px', 
                      border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--glass-border)'}`, 
                      transition: 'all 0.2s' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1 }}>
                        {opcion.image && (
                          <img src={opcion.image} alt={opcion.label} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ margin: '0 0 0.2rem 0', color: 'var(--text-primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', lineHeight: '1.2' }}>
                            <span style={{ flexShrink: 0, marginTop: '2px' }}>{opcion.icon}</span> 
                            <span>{opcion.label}</span>
                          </h3>
                          <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 'bold', fontSize: '1rem' }}>
                            ${opcion.price.toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-primary)', padding: '5px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        <button 
                          type="button" 
                          onClick={() => handleQuantityChange(opcion.id, -1)}
                          style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'var(--section-bg)', color: 'var(--text-primary)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >-</button>
                        <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{qty}</span>
                        <button 
                          type="button" 
                          onClick={() => handleQuantityChange(opcion.id, 1)}
                          style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: '#000F11', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {errors.opcionesCantidades && <span style={{ color: '#ff6961', fontSize: '0.9rem', marginTop: '1rem', display: 'block' }}>{errors.opcionesCantidades}</span>}
              
              {Object.keys(formData.opcionesCantidades).length > 0 && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px dashed var(--glass-border)', textAlign: 'right' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>Total a pagar: <span style={{ color: 'var(--accent)' }}>${total.toLocaleString('es-CO')}</span></h3>
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '1rem 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Escribe el número de tu mesa *</label>
                <input name="mesa" type="text" inputMode="numeric" pattern="[0-9]*" value={formData.mesa} onChange={handleChange} style={inputStyle('mesa')} placeholder="Ej: 5" />
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>para recibir tu pedido</p>
                {errors.mesa && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.mesa}</span>}
              </div>

              <div>
                <label style={labelStyle}>Nombre Completo *</label>
                <input name="nombre" value={formData.nombre} onChange={handleChange} style={inputStyle('nombre')} placeholder="Tu nombre" />
                {errors.nombre && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.nombre}</span>}
              </div>

              <div>
                <label style={labelStyle}>Teléfono (WhatsApp) *</label>
                <input name="telefono" type="text" inputMode="numeric" pattern="[0-9]*" value={formData.telefono} onChange={handleChange} style={inputStyle('telefono')} placeholder="300 000 0000" />
                {errors.telefono && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.telefono}</span>}
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem', lineHeight: '1.4' }}>Escanea el QR para realizar tu pago por Nequi<br/>o paga vía Bre-B con la llave <strong style={{color:'var(--accent)', wordBreak: 'break-all'}}>@MIPRIMERSOL</strong></h3>
              <div style={{ width: '200px', height: '200px', background: '#fff', padding: '10px', borderRadius: '12px', margin: '0 auto 1.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/images/qr.png" alt="QR Code" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>

              {/* Pago en efectivo */}
              <div style={{ textAlign: 'left', marginBottom: '1.5rem', padding: '1rem', background: formData.pagoEfectivo ? 'rgba(0, 222, 133, 0.1)' : 'transparent', borderRadius: '8px', border: `1px solid ${formData.pagoEfectivo ? 'var(--accent)' : 'transparent'}`, transition: 'all 0.2s' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    name="pagoEfectivo"
                    checked={formData.pagoEfectivo}
                    onChange={(e) => setFormData(prev => ({ ...prev, pagoEfectivo: e.target.checked }))}
                    style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent)' }}
                  />
                  <span style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '500' }}>Pagaremos en efectivo en la mesa</span>
                </label>
              </div>
              
              <div style={{ textAlign: 'left', opacity: formData.pagoEfectivo ? 0.5 : 1, transition: 'all 0.2s' }}>
                <label style={{ ...labelStyle, marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.3' }}>
                  <span style={{ flexShrink: 0, marginTop: '2px' }}><Upload size={18} /></span> 
                  <span>Sube tu Comprobante de Pago (Opcional)</span>
                </label>
                <input 
                  type="file" 
                  name="comprobante"
                  onChange={handleFileChange} 
                  accept="image/*,application/pdf"
                  disabled={formData.pagoEfectivo}
                  style={{ width: '100%', color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem', width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.2rem', padding: '1rem' }}>
              {loading ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </form>
        </div>
        
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', padding: '2rem', borderRadius: '20px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Confirma tu Pedido</h3>
            
            <div style={{ background: 'var(--panel-bg)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}><strong>Nombre:</strong> {formData.nombre}</p>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}><strong>Mesa:</strong> {formData.mesa}</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong>Pago:</strong> {formData.pagoEfectivo ? 'Efectivo' : 'Nequi / Bre-B'}</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Resumen</h4>
              {Object.entries(formData.opcionesCantidades).map(([id, qty]) => {
                const opcion = OPCIONES_MENU.find(opt => opt.id === id);
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
                    <span>{qty}x {opcion.label}</span>
                    <span style={{ fontWeight: 'bold' }}>${(opcion.price * qty).toLocaleString('es-CO')}</span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', color: 'var(--accent)', fontSize: '1.2rem', fontWeight: '900' }}>
                <span>TOTAL:</span>
                <span>${total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Volver a editar
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: '#000F11', fontSize: '1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Enviando...' : 'Sí, Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
