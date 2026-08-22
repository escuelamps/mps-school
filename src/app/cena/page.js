"use client";
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Upload, Utensils, Coffee, Wine, Beer, Pizza, GlassWater } from 'lucide-react';
import Link from 'next/link';

const OPCIONES_MENU = [
  { id: 'vino', label: 'Vino Caliente 2X1', price: 25000, icon: <Wine size={20} />, image: '/images/mps-vino.jpeg' },
  { id: 'hamburguesa_sola', label: 'Hamburguesa sola', price: 15000, icon: <Pizza size={20} />, image: '/images/mps-sin-papa.jpeg' },
  { id: 'hamburguesa_papas', label: 'Hamburguesa con papas', price: 18000, icon: <Pizza size={20} />, image: '/images/mps-hamburguesa.jpeg' },
  { id: 'nachos', label: 'Nachos', price: 15000, icon: <Utensils size={20} />, image: '/images/mps-nachos.jpeg' },
  { id: 'gaseosa', label: 'Gaseosa Postobon', price: 5000, icon: <Coffee size={20} /> },
  { id: 'cerveza', label: 'Cerveza (Aguila, Club Colombia, Poker)', price: 6000, icon: <Beer size={20} /> },
  { id: 'agua', label: 'Agua', price: 3000, icon: <GlassWater size={20} /> },
];

export default function CenaPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    mesa: '',
    opcionesSeleccionadas: [],
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

  const handleCheckboxChange = (id) => {
    setFormData(prev => {
      const isSelected = prev.opcionesSeleccionadas.includes(id);
      let nuevasOpciones = [];
      if (isSelected) {
        nuevasOpciones = prev.opcionesSeleccionadas.filter(item => item !== id);
      } else {
        nuevasOpciones = [...prev.opcionesSeleccionadas, id];
      }
      
      if (errors.opcionesSeleccionadas && nuevasOpciones.length > 0) {
        setErrors(e => ({...e, opcionesSeleccionadas: ''}));
      }
      
      return { ...prev, opcionesSeleccionadas: nuevasOpciones };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Requerido.';
    
    if (!formData.mesa.trim()) {
      newErrors.mesa = 'Requerido.';
    } else if (isNaN(Number(formData.mesa))) {
      newErrors.mesa = 'Debe ser un número.';
    }

    if (formData.opcionesSeleccionadas.length === 0) {
      newErrors.opcionesSeleccionadas = 'Selecciona al menos una opción.';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setLoading(true);
      try {
        let comprobanteUrl = '';
        
        const seleccionTexto = formData.opcionesSeleccionadas.map(id => {
          return OPCIONES_MENU.find(opt => opt.id === id).label;
        }).join(', ');

        // 1. LÓGICA DE FIREBASE (Para el tiempo real del Panel)
        const { db, storage } = await import('@/lib/firebase');
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

        if (formData.comprobante) {
          const fileRef = ref(storage, `comprobantes_cenas/${Date.now()}_${formData.comprobante.name}`);
          const uploadResult = await uploadBytes(fileRef, formData.comprobante);
          comprobanteUrl = await getDownloadURL(uploadResult.ref);
        }

        await addDoc(collection(db, 'cenas'), {
          nombre: formData.nombre,
          mesa: formData.mesa,
          opcionCena: seleccionTexto,
          comprobanteUrl: comprobanteUrl,
          pagoEfectivo: formData.pagoEfectivo,
          estado: formData.pagoEfectivo ? 'Efectivo (Pendiente)' : (comprobanteUrl ? 'Pendiente' : 'Sin Pago'),
          createdAt: serverTimestamp()
        });

        // 2. LÓGICA DE GOOGLE SHEETS (Para el Excel de la escuela)
        const payload = {
          sheetName: 'Cena',
          rowData: [
            formData.nombre,
            formData.mesa || "Sin mesa",
            seleccionTexto,
            formData.pagoEfectivo ? "Sí" : "No",
            formData.comprobante ? "{FILE_URL}" : "Sin comprobante"
          ]
        };

        if (formData.comprobante) {
          payload.fileData = await getBase64(formData.comprobante);
          payload.fileName = formData.comprobante.name;
          payload.mimeType = formData.comprobante.type;
        }

        await fetch("https://script.google.com/macros/s/AKfycbw6HcZFMHuTYj54kD4yx7fhF2JrDKukICKAUbaYE_64uq3OMqEeKyQ_bc-yq1-DmE2x/exec", {
          method: "POST",
          body: JSON.stringify(payload),
          mode: "no-cors"
        });
        
        setSuccess(true);
      } catch (err) {
        console.error("Error al guardar:", err);
        alert("Hubo un problema procesando tu reserva. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  // Calcular el total
  const total = formData.opcionesSeleccionadas.reduce((sum, id) => {
    const option = OPCIONES_MENU.find(o => o.id === id);
    return sum + (option ? option.price : 0);
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
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Volver al inicio
          </Link>
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
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Opciones en cajas */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {OPCIONES_MENU.map((opcion) => {
                  const isSelected = formData.opcionesSeleccionadas.includes(opcion.id);
                  return (
                    <label key={opcion.id} style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', 
                      background: isSelected ? 'rgba(0, 222, 133, 0.1)' : 'var(--panel-bg)', 
                      borderRadius: '12px', 
                      border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--glass-border)'}`, 
                      cursor: 'pointer', transition: 'all 0.2s' 
                    }}>
                      <input 
                        type="checkbox" 
                        style={{ display: 'none' }}
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(opcion.id)}
                      />
                      <div style={{ 
                        width: '24px', height: '24px', borderRadius: '6px', 
                        border: `2px solid ${isSelected ? 'var(--accent)' : '#94a3b8'}`,
                        background: isSelected ? 'var(--accent)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {isSelected && <CheckCircle2 size={16} color="#000F11" />}
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        {opcion.image && (
                          <img src={opcion.image} alt={opcion.label} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ margin: '0 0 0.2rem 0', color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', lineHeight: '1.2' }}>
                            <span style={{ flexShrink: 0, marginTop: '2px' }}>{opcion.icon}</span> 
                            <span style={{ wordBreak: 'break-word' }}>{opcion.label}</span>
                          </h3>
                          <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 'bold', fontSize: '1rem' }}>
                            ${opcion.price.toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
              {errors.opcionesSeleccionadas && <span style={{ color: '#ff6961', fontSize: '0.9rem', marginTop: '1rem', display: 'block' }}>{errors.opcionesSeleccionadas}</span>}
              
              {formData.opcionesSeleccionadas.length > 0 && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px dashed var(--glass-border)', textAlign: 'right' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>Total a pagar: <span style={{ color: 'var(--accent)' }}>${total.toLocaleString('es-CO')}</span></h3>
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '1rem 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Escribe el número de tu mesa *</label>
                <input name="mesa" type="number" value={formData.mesa} onChange={handleChange} style={inputStyle('mesa')} placeholder="Ej: 5" min="1" />
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>para recibir tu pedido</p>
                {errors.mesa && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.mesa}</span>}
              </div>

              <div>
                <label style={labelStyle}>Nombre Completo *</label>
                <input name="nombre" value={formData.nombre} onChange={handleChange} style={inputStyle('nombre')} placeholder="Tu nombre" />
                {errors.nombre && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.nombre}</span>}
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
    </main>
  );
}
