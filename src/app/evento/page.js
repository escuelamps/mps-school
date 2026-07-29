"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Calendar, MapPin, Clock, Mic2, Key } from 'lucide-react';
import Link from 'next/link';

export default function EventoPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 2500);
    return () => clearTimeout(timer);
  }, []);
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    instagram: '',
    actividad: 'Doblaje',
    cancion: '',
    fotoPoster: null,
    comprobante: null
  });

  const [errors, setErrors] = useState({});
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');

  useEffect(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file && file.size > 15 * 1024 * 1024) {
      alert(`El archivo es demasiado grande. El tamaño máximo es 15 MB.`);
      e.target.value = null;
      setFormData(prev => ({ ...prev, [field]: null }));
    } else {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Requerido.';
    if (!formData.telefono.trim()) newErrors.telefono = 'Requerido.';
    if (!formData.instagram.trim()) newErrors.instagram = 'Requerido.';
    if (!formData.cancion.trim()) newErrors.cancion = 'Requerido.';
    if (!captchaInput.trim()) {
      newErrors.captcha = 'Requerido.';
    } else if (parseInt(captchaInput) !== captchaNum1 + captchaNum2) {
      newErrors.captcha = 'Respuesta incorrecta.';
    }
    
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
        const payload = {
          nombre: formData.nombre,
          telefono: formData.telefono,
          instagram: formData.instagram,
          actividad: formData.actividad,
          cancion: formData.cancion,
        };

        if (formData.comprobante) {
          payload.fileData = await getBase64(formData.comprobante);
          payload.fileName = formData.comprobante.name;
          payload.mimeType = formData.comprobante.type;
        }

        if (formData.fotoPoster) {
          payload.fotoPosterData = await getBase64(formData.fotoPoster);
          payload.fotoPosterName = formData.fotoPoster.name;
          payload.fotoPosterMimeType = formData.fotoPoster.type;
        }

        await fetch("https://script.google.com/macros/s/AKfycbz4eLIEHfBe5Wno9XoMhT5GugUkK8X-qyItH2MXRQGqgAfKDGx0blD8WLAyXGgE664FFg/exec", {
          method: "POST",
          body: JSON.stringify(payload),
          mode: "no-cors"
        });
        
        setSuccess(true);
      } catch (err) {
        console.error("Error:", err);
        // Si falla por algún motivo de red, igual mostramos éxito para no bloquear al usuario (comportamiento por defecto con no-cors)
        setSuccess(true);
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

  if (!pageLoaded) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <img src="/images/eveno-mps.jpeg" alt="Loading Noches MPS" className="img-glow" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', opacity: 0.9, marginBottom: '2rem' }} />
        <div style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,0.8)', textAlign: 'center' }}>
          Cargando Evento...
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem' }}>
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(0, 222, 133, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
            <CheckCircle2 size={40} color="var(--accent)" />
          </div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>¡Registro Exitoso!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Tu puesto para el Open Mic ha sido reservado. ¡Nos vemos este viernes!
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
    background: 'rgba(255,255,255,0.05)', 
    border: `1px solid ${errors[name] ? '#ff6961' : 'rgba(0,222,133,0.3)'}`, 
    color: 'var(--text-primary)', outline: 'none'
  });
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent)' };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)', padding: '2rem 5% 6rem 5%', position: 'relative' }}>
      <Link href="/" style={{ position: 'absolute', top: '2rem', left: '2rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <ArrowLeft size={20} /> Volver
      </Link>

      <div style={{ maxWidth: '1000px', margin: '4rem auto 0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
        
        {/* INFO DEL EVENTO */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,222,133,0.1)', color: 'var(--accent)', padding: '0.5rem 1rem', borderRadius: '20px', marginBottom: '1rem', fontWeight: 'bold' }}>
            <Mic2 size={18} /> Evento Especial
          </div>
          <h1 className="text-gradient" style={{ fontSize: '4rem', lineHeight: '1.1', marginBottom: '1.5rem' }}>
            Noches MPS
          </h1>
          
          <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.8rem', fontSize: '1.3rem' }}>Actividades:</h3>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li><strong>Espacio Presentación Artistas:</strong> De 1 a 2 temas (1 para grabación y 1 para muestra).</li>
              <li><strong>Karaoke y Doblaje.</strong></li>
              <li><strong>$20.000 Consumibles:</strong> El valor de tu entrada será 100% consumible durante el evento.</li>
            </ul>

            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.8rem', fontSize: '1.3rem' }}>Premios del Evento:</h3>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li><strong>1er Puesto:</strong> Paquete de 4 clases en la escuela (Música / Actuación / Expresión Corporal) O 4 sesiones de ensayo de 2 horas en la escuela + Futuro Open Mic NO paga cover.</li>
              <li><strong>2do y 3er Puesto:</strong> Cover gratuito en futuros Open Mics en la escuela.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0, 222, 133, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.5rem' }}>$</span>
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>Boleta</h3>
                <p style={{ color: 'var(--accent)', margin: 0, fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  $20.000 (Pagos vía <img src="/images/nequi-logo.png" alt="Nequi" style={{ height: '14px', objectFit: 'contain' }} /> o <img src="/images/bre-b-logo.png" alt="Bre-B" style={{ height: '14px', objectFit: 'contain' }} />)
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>Inscripciones Abiertas</h3>
                <p style={{ color: '#ff6961', margin: 0, fontWeight: '500' }}>Fecha límite: Viernes 31 julio, 6:00 PM</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>Hora del Evento</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>7:00 PM</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>Lugar</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Sede Principal MPS</p>
              </div>
            </div>

          </div>
        </div>

        {/* FORMULARIO DE REGISTRO */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.8rem' }}>Asegura tu lugar</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Cupos limitados por aforo de la sede.</p>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Nombre Completo *</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} style={inputStyle('nombre')} placeholder="Tu nombre" />
              {errors.nombre && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.nombre}</span>}
            </div>

            <div>
              <label style={labelStyle}>Número de Celular (WhatsApp) *</label>
              <input name="telefono" type="number" value={formData.telefono} onChange={handleChange} style={inputStyle('telefono')} placeholder="300 000 0000" />
              {errors.telefono && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.telefono}</span>}
            </div>

            <div>
              <label style={labelStyle}>Instagram *</label>
              <input name="instagram" value={formData.instagram} onChange={handleChange} style={inputStyle('instagram')} placeholder="@tu_usuario" />
              {errors.instagram && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.instagram}</span>}
            </div>

            <div>
              <label style={labelStyle}>Actividad de interés *</label>
              <select name="actividad" value={formData.actividad} onChange={handleChange} style={inputStyle('actividad')}>
                <option value="Doblaje">Doblaje</option>
                <option value="Karaoke">Karaoke</option>
                <option value="Música en vivo">Música en vivo</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Formato / ¿Qué canción? (Pista) *</label>
              <input name="cancion" value={formData.cancion} onChange={handleChange} style={inputStyle('cancion')} placeholder="Nombre de la canción y artista" />
              {errors.cancion && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.cancion}</span>}
            </div>

            <div>
              <label style={labelStyle}>Foto para el poster</label>
              <input 
                type="file" 
                name="fotoPoster" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'fotoPoster')} 
                style={{ ...inputStyle('fotoPoster'), padding: '0.6rem', cursor: 'pointer' }} 
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                Sube una foto tuya para incluirte en el póster del evento (Máx. 15 MB).
              </p>
            </div>

            <div>
              <label style={labelStyle}>Comprobante de Pago</label>
              <input 
                type="file" 
                name="comprobante" 
                accept="image/*,.pdf" 
                onChange={(e) => handleFileChange(e, 'comprobante')} 
                style={{ ...inputStyle('comprobante'), padding: '0.6rem', cursor: 'pointer' }} 
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                Puedes subir una captura de pantalla de tu transferencia (Nequi / Bre-B). Máx. 15 MB.
              </p>
            </div>

            <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem', display: 'block' }}>Verificación (Anti-bot) *</label>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>¿Cuánto es {captchaNum1} + {captchaNum2}?</p>
              <input 
                type="number" 
                value={captchaInput} 
                onChange={(e) => setCaptchaInput(e.target.value)} 
                style={inputStyle('captcha')} 
                placeholder="Escribe el resultado" 
              />
              {errors.captcha && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.captcha}</span>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem', width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Reservando...' : 'Confirmar Asistencia'}
            </button>

            <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Escanea este código en tu app de Nequi para realizar el pago
              </p>
              <img src="/images/qr.png" alt="QR Nequi" style={{ width: '180px', height: '180px', objectFit: 'contain', margin: '0 auto 1rem auto', display: 'block', borderRadius: '8px' }} />
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                También puedes pagar con llave Bre-B <br/>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Key size={16} /> 0087697624
                </strong> <br/>
                a nombre de Laura Pineda
              </p>
            </div>
          </form>
        </div>
        
      </div>
    </main>
  );
}
