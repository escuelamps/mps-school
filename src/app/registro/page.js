"use client";
import { useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import dataCiudades from '../../data/ciudades.json';

export default function RegistroPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  // State for all 20+ fields
  const [formData, setFormData] = useState({
    // Step 1: Titular
    titularNombre: '',
    titularCedula: '',
    email: '',
    telefono: '',
    direccion: '',
    barrio: '',
    ciudad: '',
    
    // Step 2: Estudiante
    estudianteNombre: '',
    estudianteDocumento: '',
    fechaNacimiento: '',
    instrumento: '',
    instrumentoComplementario: '',
    
    // Step 3: Contactos
    contacto1Nombre: '',
    contacto1Parentesco: '',
    contacto1Celular: '',
    contacto2Nombre: '',
    contacto2Celular: '',
    
    // Step 4: Detalles
    paqueteHoras: '',
    fechaPago: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.titularNombre.trim()) newErrors.titularNombre = 'Requerido.';
      if (!formData.email.trim()) newErrors.email = 'Requerido.';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Falta el @ o el punto.';
      if (!formData.telefono.trim()) newErrors.telefono = 'Requerido.';
      if (!formData.direccion.trim()) newErrors.direccion = 'Requerido.';
    }
    if (step === 2) {
      if (!formData.estudianteNombre.trim()) newErrors.estudianteNombre = 'Requerido.';
      if (!formData.estudianteDocumento.trim()) newErrors.estudianteDocumento = 'Requerido.';
      if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'Requerido.';
      if (!formData.instrumento) newErrors.instrumento = 'Selecciona una opción.';
    }
    if (step === 3) {
      if (!formData.contacto1Nombre.trim()) newErrors.contacto1Nombre = 'Requerido.';
      if (!formData.contacto1Parentesco.trim()) newErrors.contacto1Parentesco = 'Requerido.';
      if (!formData.contacto1Celular.trim()) newErrors.contacto1Celular = 'Requerido.';
      if (!formData.contacto2Nombre.trim()) newErrors.contacto2Nombre = 'Requerido.';
      if (!formData.contacto2Celular.trim()) newErrors.contacto2Celular = 'Requerido.';
    }
    if (step === 4) {
      if (!formData.password) newErrors.password = 'Requerido.';
      else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => prev + 1);
  };
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    
    if (validateStep(4)) {
      setLoading(true);
      try {
        // 1. Firebase Auth: Crear Usuario
        const { auth } = await import('../../lib/firebase');
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.estudianteNombre });

        // 2. Google Forms (Headless): Enviar datos masivos
        const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSci_KW3CWU3lqCWPn68of5bqxZi_YfSEhi-kigcTsqA_9npSg/formResponse';
        const params = new URLSearchParams();
        
        // Manejo de múltiples secciones en Google Forms
        params.append('pageHistory', '0,1,2,3,4,5,6');
        
        // Administrativo automático
        const hoy = new Date().toISOString().split('T')[0];
        params.append('entry.1324385550', hoy); // Fecha matricula
        params.append('entry.1736763103', ''); // Valor paquete (vacío por ahora)
        
        // Paso 1
        params.append('entry.1291232643', formData.titularNombre);
        params.append('entry.495403100', formData.titularCedula);
        params.append('entry.1820678840', formData.email);
        params.append('entry.955583449', formData.telefono);
        params.append('entry.1354418441', formData.direccion);
        params.append('entry.1344869468', formData.barrio);
        params.append('entry.23554403', formData.ciudad);
        
        // Paso 2
        params.append('entry.1585339906', formData.estudianteNombre);
        params.append('entry.1600496359', formData.estudianteDocumento);
        params.append('entry.1062232074', formData.fechaNacimiento);
        params.append('entry.1213056784', formData.instrumento);
        params.append('entry.748271263', formData.instrumentoComplementario || 'Ninguno');
        
        // Paso 3
        params.append('entry.1321350458', formData.contacto1Nombre);
        params.append('entry.851786565', formData.contacto1Parentesco);
        params.append('entry.211548097', formData.contacto1Celular);
        params.append('entry.2135025709', formData.contacto2Nombre || 'N/A');
        params.append('entry.1759739304', formData.contacto2Celular || 'N/A');
        
        // Paso 4
        params.append('entry.976621532', formData.paqueteHoras);
        params.append('entry.1163506886', formData.fechaPago);

        await fetch(GOOGLE_FORM_ACTION, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });

        setSuccess(true);
      } catch (err) {
        console.error("Error:", err);
        if (err.code === 'auth/email-already-in-use') {
          setAuthError('El correo electrónico ya está registrado. Por favor, inicia sesión.');
        } else {
          setAuthError('Ocurrió un error inesperado. Inténtalo de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Si cambian de ciudad y ya no es Bogotá, borrar el barrio seleccionado
      if (name === 'ciudad' && value !== 'Bogotá') {
        updated.barrio = '';
      }
      return updated;
    });

    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  if (success) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem' }}>
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(0, 222, 133, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
            <CheckCircle2 size={40} color="var(--accent)" />
          </div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>¡Matrícula Exitosa!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Tu cuenta ha sido creada y tus datos administrativos fueron enviados a la escuela correctamente.
          </p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Ir a mi cuenta
          </Link>
        </div>
      </main>
    );
  }

  const inputStyle = (name) => ({
    width: '100%', padding: '0.8rem', borderRadius: '8px', 
    background: 'rgba(255,255,255,0.05)', 
    border: `1px solid ${errors[name] ? '#ff6961' : 'rgba(0,222,133,0.3)'}`, 
    color: 'white', outline: 'none'
  });
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent)' };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)', padding: '2rem' }}>
      <Link href="/" style={{ position: 'absolute', top: '2rem', left: '2rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <ArrowLeft size={20} /> Volver
      </Link>

      <div className="glass-card" style={{ maxWidth: '700px', width: '100%', padding: '2.5rem' }}>
        
        {/* PROGRESS BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
          <div style={{ position: 'absolute', top: '50%', left: 0, width: `${((currentStep - 1) / 3) * 100}%`, height: '2px', background: 'var(--accent)', transition: 'width 0.3s ease', zIndex: 0 }}></div>
          
          {[1, 2, 3, 4].map(step => (
            <div key={step} style={{ 
              width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
              background: currentStep >= step ? 'var(--accent)' : 'var(--bg-secondary)',
              color: currentStep >= step ? 'black' : 'white', fontWeight: 'bold', transition: 'all 0.3s'
            }}>
              {step}
            </div>
          ))}
        </div>

        <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          {currentStep === 1 && "Datos del Titular / Acudiente"}
          {currentStep === 2 && "Datos del Estudiante"}
          {currentStep === 3 && "Contactos de Emergencia"}
          {currentStep === 4 && "Detalles del Programa"}
        </h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
          Paso {currentStep} de 4
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {authError && (
            <div style={{ padding: '0.8rem', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', borderRadius: '8px', color: '#ff4444', marginBottom: '1.5rem', textAlign: 'center' }}>
              {authError}
            </div>
          )}

          {/* PASO 1 */}
          {currentStep === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Nombre Completo Titular *</label>
                <input name="titularNombre" value={formData.titularNombre} onChange={handleChange} style={inputStyle('titularNombre')} />
                {errors.titularNombre && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.titularNombre}</span>}
              </div>
              <div>
                <label style={labelStyle}>Cédula</label>
                <input name="titularCedula" type="number" value={formData.titularCedula} onChange={handleChange} style={inputStyle('titularCedula')} />
                {errors.titularCedula && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.titularCedula}</span>}
              </div>
              <div>
                <label style={labelStyle}>Correo Electrónico *</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} style={inputStyle('email')} />
                {errors.email && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.email}</span>}
              </div>
              <div>
                <label style={labelStyle}>Teléfono Celular *</label>
                <input name="telefono" type="number" value={formData.telefono} onChange={handleChange} style={inputStyle('telefono')} />
                {errors.telefono && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.telefono}</span>}
              </div>
              <div>
                <label style={labelStyle}>Ciudad</label>
                <select name="ciudad" value={formData.ciudad} onChange={handleChange} style={inputStyle('ciudad')}>
                  <option value="">Selecciona tu ciudad...</option>
                  {dataCiudades.ciudades.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.ciudad && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.ciudad}</span>}
              </div>
              
              {formData.ciudad === 'Bogotá' && (
                <div>
                  <label style={labelStyle}>Barrio (Localidad)</label>
                  <select name="barrio" value={formData.barrio} onChange={handleChange} style={inputStyle('barrio')}>
                    <option value="">Selecciona la localidad...</option>
                    {dataCiudades.zonas_bogota.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  {errors.barrio && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.barrio}</span>}
                </div>
              )}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Dirección de Residencia *</label>
                <input name="direccion" value={formData.direccion} onChange={handleChange} style={inputStyle('direccion')} />
                {errors.direccion && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.direccion}</span>}
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {currentStep === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Nombre Completo del Estudiante *</label>
                <input name="estudianteNombre" value={formData.estudianteNombre} onChange={handleChange} style={inputStyle('estudianteNombre')} />
                {errors.estudianteNombre && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.estudianteNombre}</span>}
              </div>
              <div>
                <label style={labelStyle}>Número de Documento *</label>
                <input name="estudianteDocumento" type="number" value={formData.estudianteDocumento} onChange={handleChange} style={inputStyle('estudianteDocumento')} />
                {errors.estudianteDocumento && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.estudianteDocumento}</span>}
              </div>
              <div>
                <label style={labelStyle}>Fecha de Nacimiento *</label>
                <input name="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={handleChange} style={inputStyle('fechaNacimiento')} />
                {errors.fechaNacimiento && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.fechaNacimiento}</span>}
              </div>
              <div>
                <label style={labelStyle}>Instrumento Principal *</label>
                <select name="instrumento" value={formData.instrumento} onChange={handleChange} style={inputStyle('instrumento')}>
                  <option value="">Selecciona...</option>
                  <option value="Guitarra">Guitarra</option>
                  <option value="Piano">Piano</option>
                  <option value="Teatro">Teatro</option>
                  <option value="Batería">Batería</option>
                </select>
                {errors.instrumento && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.instrumento}</span>}
              </div>
              <div>
                <label style={labelStyle}>Instrumento Complementario (Opcional)</label>
                <select name="instrumentoComplementario" value={formData.instrumentoComplementario} onChange={handleChange} style={inputStyle('instrumentoComplementario')}>
                  <option value="">Ninguno</option>
                  <option value="Guitarra">Guitarra</option>
                  <option value="Piano">Piano</option>
                  <option value="Teatro">Teatro</option>
                  <option value="Batería">Batería</option>
                </select>
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Contacto de Emergencia 1</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={labelStyle}>Nombre *</label>
                    <input name="contacto1Nombre" value={formData.contacto1Nombre} onChange={handleChange} style={inputStyle('contacto1Nombre')} />
                    {errors.contacto1Nombre && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.contacto1Nombre}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>Parentesco *</label>
                    <input name="contacto1Parentesco" value={formData.contacto1Parentesco} onChange={handleChange} style={inputStyle('contacto1Parentesco')} />
                    {errors.contacto1Parentesco && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.contacto1Parentesco}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>Celular *</label>
                    <input name="contacto1Celular" type="number" value={formData.contacto1Celular} onChange={handleChange} style={inputStyle('contacto1Celular')} />
                    {errors.contacto1Celular && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.contacto1Celular}</span>}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Contacto de Emergencia 2</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Nombre *</label>
                    <input name="contacto2Nombre" value={formData.contacto2Nombre} onChange={handleChange} style={inputStyle('contacto2Nombre')} />
                    {errors.contacto2Nombre && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.contacto2Nombre}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>Celular *</label>
                    <input name="contacto2Celular" type="number" value={formData.contacto2Celular} onChange={handleChange} style={inputStyle('contacto2Celular')} />
                    {errors.contacto2Celular && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.contacto2Celular}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 4 */}
          {currentStep === 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Paquete de clases por semana</label>
                <select name="paqueteHoras" value={formData.paqueteHoras} onChange={handleChange} style={inputStyle('paqueteHoras')}>
                  <option value="">Selecciona...</option>
                  <option value="1 hora">1 hora a la semana</option>
                  <option value="2 horas">2 horas a la semana</option>
                  <option value="4 horas">4 horas a la semana</option>
                </select>
                {errors.paqueteHoras && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.paqueteHoras}</span>}
              </div>
              <div>
                <label style={labelStyle}>Día en el que realizará su pago (Mensual)</label>
                <input name="fechaPago" type="date" value={formData.fechaPago} onChange={handleChange} style={inputStyle('fechaPago')} />
                {errors.fechaPago && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.fechaPago}</span>}
              </div>
              
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>Seguridad del Portal</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Crea una contraseña segura. El correo del titular ({formData.email || 'tu email'}) será usado para iniciar sesión.
                </p>
                <div>
                  <label style={labelStyle}>Contraseña *</label>
                  <input name="password" type="password" value={formData.password} onChange={handleChange} style={inputStyle('password')} placeholder="Mínimo 6 caracteres" />
                  {errors.password && <span style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.password}</span>}
                </div>
              </div>
            </div>
          )}

          {/* BOTONES DE NAVEGACION */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', gap: '1rem' }}>
            {currentStep > 1 ? (
              <button type="button" onClick={prevStep} style={{ padding: '0.8rem 2rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                Atrás
              </button>
            ) : <div></div>}
            
            {currentStep < 4 ? (
              <button type="button" onClick={nextStep} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Siguiente <ArrowRight size={18} />
              </button>
            ) : (
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', maxWidth: '250px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Procesando...' : 'Crear Cuenta'}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
