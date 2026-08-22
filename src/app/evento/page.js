"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Calendar, MapPin, Clock, Mic2, Key, Upload } from 'lucide-react';
import Link from 'next/link';
import HabeasDataConsent from '@/components/HabeasDataConsent';

export default function EventoPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    comprobante: null,
  });
  
  const [habeasAccepted, setHabeasAccepted] = useState(false);

  const [errors, setErrors] = useState({});
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');

  useEffect(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

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

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Requerido.';
    
    const telefonoNumeros = formData.telefono.replace(/\D/g, '');
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'Requerido.';
    } else if (telefonoNumeros.length !== 10) {
      newErrors.telefono = 'Número de 10 dígitos';
    }
    
    if (!formData.comprobante) newErrors.comprobante = 'Requerido.';
    
    if (!captchaInput.trim()) {
      newErrors.captcha = 'Requerido.';
    } else if (parseInt(captchaInput) !== captchaNum1 + captchaNum2) {
      newErrors.captcha = 'Respuesta incorrecta.';
    }
    
    if (!habeasAccepted) newErrors.habeas = true;
    
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
          sheetName: 'Evento',
          headers: ["Fecha", "Nombre", "Teléfono", "Recibo"],
          rowData: [
            formData.nombre,
            formData.telefono,
            formData.comprobante ? "{FILE_URL}" : "Sin comprobante"
          ]
        };

        if (formData.comprobante) {
          payload.fileData = await getBase64(formData.comprobante);
          payload.fileName = formData.comprobante.name;
          payload.mimeType = formData.comprobante.type;
        }

        await fetch("https://script.google.com/macros/s/AKfycbwTBsWzVQL4jmsNB9Y6kQsEW1cQQ47aVNE0H6rAYAdogF9FrAJK1VCDUbShnBm0K480/exec", {
          method: "POST",
          body: JSON.stringify(payload),
          mode: "no-cors"
        });
        
        setSuccess(true);
      } catch (err) {
        console.error("Error:", err);
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

  if (success) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem' }}>
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(0, 222, 133, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
            <CheckCircle2 size={40} color="var(--accent)" />
          </div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>¡Registro Exitoso!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Tu registro ha sido recibido. ¡Nos vemos pronto!
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

      <div style={{ maxWidth: '1000px', margin: '4rem auto 0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
        
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,222,133,0.1)', color: 'var(--accent)', padding: '0.5rem 1rem', borderRadius: '20px', marginBottom: '1rem', fontWeight: 'bold' }}>
            <Mic2 size={18} /> Evento Especial
          </div>
          <h1 className="text-gradient" style={{ fontSize: '3.5rem', lineHeight: '1.1', marginBottom: '1.5rem' }}>
            NOCHES MPS: CONCIERTO DE PIANO
          </h1>
          
          <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              <strong>Una velada mágica alrededor del piano ✨🎹</strong><br/><br/>
              Este sábado 22 de agosto, a partir de las 6:30 p. m., acompáñanos en una nueva sesión de Noches MPS dedicada a disfrutar de las más bellas melodías en vivo.
            </p>

            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.8rem', fontSize: '1.3rem' }}>🎶 CONCIERTO DE PIANO</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Relájate y déjate llevar por las notas musicales en un ambiente íntimo y acogedor. Una experiencia diseñada para conectar con el arte y la tranquilidad.
            </p>

            <div style={{ background: 'rgba(0,222,133,0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,222,133,0.2)' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-primary)' }}>
                📅 Sábado 22 de agosto<br/>
                ⏰ 6:30 p. m.<br/>
                🎶 Concierto de Piano en Vivo<br/>
                🎟️ Valor de la Entrada: $20.000
              </p>
            </div>
            
            <p style={{ marginTop: '1.5rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>
              ✨ NOCHES MPS<br/>
              Una noche para encontrarnos.<br/>
              Una noche para la música.<br/><br/>
              Te esperamos. 🎹💛
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--panel-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0, 222, 133, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.5rem' }}>$</span>
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>Boleta</h3>
                <p style={{ color: 'var(--accent)', margin: 0, fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  $20.000 (Pagos vía <img src="/images/bre-b-2.jpeg" alt="Bre-B" style={{ height: '24px', objectFit: 'contain' }} />)
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--panel-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                <Calendar color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>Inscripciones Abiertas</h3>
                <p style={{ color: '#ff6961', margin: 0, fontWeight: '500' }}>Fecha límite: Sábado 22 de agosto, 6:30 PM</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--panel-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                <Clock color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>Hora del Evento</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>7:00 PM</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--panel-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                <MapPin color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>Lugar</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                  <a href="https://www.google.com/maps/place/Escuela+MPS/@4.6461109,-74.0711018,17z/data=!3m1!4b1!4m6!3m5!1s0x43b5b5971db7523f:0x2ffda2f809e354b7!8m2!3d4.6461109!4d-74.0685269!16s%2Fg%2F11kqsds_d2?entry=ttu&g_ep=EgoyMDI2MDgwOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-link)', textDecoration: 'underline' }}>
                    Sede Principal MPS
                  </a>
                </p>
              </div>
            </div>

          </div>
        </div>

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
              <label style={labelStyle}>Teléfono (WhatsApp) *</label>
              <input name="telefono" type="number" value={formData.telefono} onChange={handleChange} style={inputStyle('telefono')} placeholder="300 000 0000" />
              {errors.telefono && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.telefono}</span>}
            </div>

            <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: `1px solid ${errors.comprobante ? '#ff6961' : 'var(--glass-border)'}` }}>
              <label style={{ ...labelStyle, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} /> Comprobante de Pago *
              </label>
              <input 
                type="file" 
                name="comprobante"
                onChange={handleFileChange} 
                accept="image/*,application/pdf"
                style={{ width: '100%', color: 'var(--text-secondary)' }}
              />
              {errors.comprobante && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.comprobante}</span>}
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                Sube el pantallazo de tu transferencia. Máx. 15 MB.
              </p>
            </div>

            <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
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
            
            <HabeasDataConsent 
              checked={habeasAccepted}
              onChange={(e) => {
                setHabeasAccepted(e.target.checked);
                if (errors.habeas) setErrors({ ...errors, habeas: false });
              }}
              hasError={errors.habeas}
            />

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem', width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Reservando...' : 'Confirmar Asistencia'}
            </button>

            <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                Paga tu boleta usando la llave Bre-B <br/>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Key size={16} /> @miprimersol
                </strong>
              </p>
            </div>
          </form>
        </div>
        
      </div>
    </main>
  );
}
