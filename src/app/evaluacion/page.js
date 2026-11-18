'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import HeaderV3 from '@/components/HeaderV3';
import FooterV3 from '@/components/FooterV3';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Music, 
  Mic2, 
  Headphones, 
  Radio, 
  Layers, 
  Clock, 
  Award, 
  ShieldCheck, 
  Heart, 
  Star,
  Send,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Zap,
  Play
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Cátedras e Instrumentos Oficiales de Escuela MPS
const INSTRUMENTS_OPTIONS = [
  { id: 'canto', name: 'Técnica Vocal y Canto', icon: '🎤', desc: 'Respiración, afinación, proyección y expresión escénica' },
  { id: 'piano', name: 'Piano y Teclados', icon: '🎹', desc: 'Lectura, digitación, repertorio clásico y moderno' },
  { id: 'guitarra', name: 'Guitarra (Acústica y Eléctrica)', icon: '🎸', desc: 'Acordes, escalas, fraseo, solos y acompañamiento' },
  { id: 'bateria', name: 'Batería y Percusión', icon: '🥁', desc: 'Pulso, coordinación de extremidades, grooves y dinámicas' },
  { id: 'bajo', name: 'Bajo Eléctrico', icon: '🎸', desc: 'Líneas de bajo, groove, tiempo y enlace con la batería' },
  { id: 'violin', name: 'Violín y Cuerdas Clásicas', icon: '🎻', desc: 'Postura, arco, afinación precisa y sonoridad' },
  { id: 'actuacion', name: 'Taller de Actuación MPS', icon: '🎭', desc: 'Arte dramático, voz, expresión corporal y montaje en vivo' },
  { id: 'produccion', name: 'MPS PRODUCER (Audio)', icon: '🎧', desc: 'Grabación, mezcla, masterización y creación en DAW' }
];

// Géneros musicales para la nube de chips
const GENRES_OPTIONS = [
  'Rock & Pop',
  'Balada & Cantautor',
  'Música Clásica',
  'Jazz & Blues',
  'Salsa & Tropical',
  'Urbano / Reggaetón',
  'R&B / Soul',
  'Metal / Hard Rock',
  'Indie / Alternativo',
  'Música Colombiana & Folk'
];

// Componente de Sellos de Confianza y Garantía
function TrustBadges({ compact = false }) {
  return (
    <div 
      className="trust-badges-card"
      style={{
        background: 'var(--panel-bg, rgba(255, 255, 255, 0.02))',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: compact ? '1.25rem 0.75rem' : '1.6rem 1rem',
        marginTop: compact ? '2rem' : '1.75rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .trust-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          align-items: stretch;
        }
        .trust-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0.5rem 0.8rem;
        }
        .trust-col:not(:last-child) {
          border-right: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
        }
        @media (max-width: 768px) {
          .trust-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem 0.5rem;
          }
          .trust-col:nth-child(2) {
            border-right: none;
          }
        }
        @media (max-width: 480px) {
          .trust-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}} />

      <div className="trust-grid">
        {/* Sello 1: Privacidad */}
        <div className="trust-col">
          <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '0.65rem' }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="23" fill="#FFE2E8" />
              <line x1="47" y1="12" x2="52" y2="9" stroke="#FF758F" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="48" y1="20" x2="53" y2="20" stroke="#FF758F" strokeWidth="2.2" strokeLinecap="round" />
              <rect x="18" y="24" width="20" height="17" rx="3.5" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2.2" />
              <path d="M22 24V19C22 15.6863 24.6863 13 28 13C31.3137 13 34 15.6863 34 19V24" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M28 35.2C28 35.2 24.5 33 24.5 30.8C24.5 29.5 25.5 28.5 26.8 28.5C27.5 28.5 28 28.9 28 28.9C28 28.9 28.5 28.5 29.2 28.5C30.5 28.5 31.5 29.5 31.5 30.8C31.5 33 28 35.2 28 35.2Z" fill="#FF4D6D" />
            </svg>
          </div>
          <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            Privacidad
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
            Tus datos están protegidos
          </div>
        </div>

        {/* Sello 2: Compra segura */}
        <div className="trust-col">
          <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '0.65rem' }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="23" fill="#FFF0D4" />
              <line x1="47" y1="12" x2="52" y2="9" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="48" y1="20" x2="53" y2="20" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M28 14L37 18V27.5C37 33.5 33.2 38.8 28 41C22.8 38.8 19 33.5 19 27.5V18L28 14Z" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M24 27.5L26.8 30.5L32.5 24.5" stroke="#1F2937" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            Compra segura
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
            Pago seguro y protegido
          </div>
        </div>

        {/* Sello 3: Entrega por email */}
        <div className="trust-col">
          <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '0.65rem' }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="23" fill="#FFE2E8" />
              <line x1="47" y1="12" x2="52" y2="9" stroke="#FF758F" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="48" y1="20" x2="53" y2="20" stroke="#FF758F" strokeWidth="2.2" strokeLinecap="round" />
              <rect x="18" y="20" width="20" height="16" rx="2.5" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2.2" />
              <path d="M19 21.5L28 28.5L37 21.5" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            Entrega por email
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
            Recíbelo directamente en tu correo
          </div>
        </div>

        {/* Sello 4: 7 días de garantía */}
        <div className="trust-col">
          <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '0.65rem' }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="23" fill="#FFE8D6" />
              <line x1="47" y1="12" x2="52" y2="9" stroke="#FB923C" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="48" y1="20" x2="53" y2="20" stroke="#FB923C" strokeWidth="2.2" strokeLinecap="round" />
              <rect x="18" y="19" width="20" height="19" rx="3" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2.2" />
              <line x1="18" y1="25" x2="38" y2="25" stroke="#1F2937" strokeWidth="1.8" />
              <line x1="22.5" y1="16.5" x2="22.5" y2="20" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="28" y1="16.5" x2="28" y2="20" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="33.5" y1="16.5" x2="33.5" y2="20" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />
              <text x="28" y="34.5" textAnchor="middle" fontSize="10.5" fontWeight="900" fontFamily="sans-serif" fill="#1F2937">7</text>
            </svg>
          </div>
          <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            7 días de garantía
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
            Compra con tranquilidad
          </div>
        </div>
      </div>
    </div>
  );
}

function EvaluacionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Paso actual (1: Contacto, 2: Instrumento y Modalidad, 3: Gustos, 4: Ritmo y Oído, 5: Metas y Memoria, 6: Cálculo, 7: Resultados)
  const [step, setStep] = useState(1);

  // Estados del Formulario (Basado en el Formulario Oficial MPS de 26 preguntas)
  const [formData, setFormData] = useState({
    // Bloque 1: Contacto
    nombre: '',
    edad: '',
    acudiente: '',
    telefono: '',
    email: '',
    // Bloque 2: Instrumento y Modalidad
    instrumento: 'canto',
    modalidad: 'sede', // 'sede' | 'domicilio' | 'virtual'
    // Bloque 3: Gustos Musicales
    gustosGeneros: ['Rock & Pop'],
    artistasFavoritos: '',
    // Bloque 4: Diagnóstico Rítmico y Melódico
    nivelRitmo: 'intermedio', // 'cero' | 'basico' | 'intermedio' | 'avanzado'
    nivelMelodia: 'intermedio', // 'cero' | 'basico' | 'intermedio' | 'avanzado'
    memoriaVisual: 'buena', // 'basica' | 'buena' | 'excelente'
    memoriaMotora: 'buena', // 'basica' | 'buena' | 'excelente'
    memoriaAuditiva: 'buena', // 'basica' | 'buena' | 'excelente'
    // Bloque 5: Metas y Motivación
    objetivoPrincipal: 'tocar-en-vivo', // 'tocar-en-vivo' | 'satisfaccion-personal' | 'vencer-miedo' | 'preuniversitario' | 'produccion'
    horasPracticaSemana: '3-a-5',
    experienciaPrevia: 'algo', // 'ninguna' | 'algo' | 'avanzada'
  });

  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [evaluationId, setEvaluationId] = useState(null);

  // Animación "Labor Illusion"
  const [calcProgress, setCalcProgress] = useState(0);
  const [calcStatusText, setCalcStatusText] = useState('Analizando perfil...');

  // Leer parámetro de curso si viene de /cursos (ej. /evaluacion?course=guitarra)
  useEffect(() => {
    const courseParam = searchParams.get('course') || searchParams.get('c');
    if (courseParam) {
      const match = INSTRUMENTS_OPTIONS.find(i => i.id === courseParam.toLowerCase());
      if (match) {
        setFormData(prev => ({ ...prev, instrumento: match.id }));
      }
    }
  }, [searchParams]);

  // Manejar cambios en inputs de texto
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Manejar toggle de chips de género
  const handleToggleGenre = (genre) => {
    setFormData(prev => {
      const exists = prev.gustosGeneros.includes(genre);
      const updated = exists 
        ? prev.gustosGeneros.filter(g => g !== genre)
        : [...prev.gustosGeneros, genre];
      return { ...prev, gustosGeneros: updated };
    });
  };

  // Validaciones por paso
  const handleNextStep = () => {
    const errors = {};

    if (step === 1) {
      if (!formData.nombre.trim()) errors.nombre = 'Ingresa el nombre del estudiante';
      if (!formData.edad.trim()) errors.edad = 'Ingresa la edad';
      if (!formData.telefono.trim() || formData.telefono.length < 7) {
        errors.telefono = 'Ingresa un número de celular o WhatsApp válido';
      }
      if (formData.email && !formData.email.includes('@')) {
        errors.email = 'Ingresa un correo electrónico válido';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    // Si está en el paso 5, pasamos al cálculo algorítmico animado (Paso 6)
    if (step === 5) {
      setStep(6);
      startCalculationAnimation();
      return;
    }

    setStep(prev => prev + 1);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Secuencia de "Labor Illusion" inspirada en Jaramillo
  const startCalculationAnimation = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setCalcProgress(progress);

      if (progress === 20) setCalcStatusText('Procesando respuestas rítmicas y auditivas...');
      if (progress === 45) setCalcStatusText('Mapeando memoria motriz y estilo de aprendizaje...');
      if (progress === 70) setCalcStatusText('Seleccionando repertorio y metodología pedagógica...');
      if (progress === 90) setCalcStatusText('Generando tu Ruta de Aprendizaje Personalizada (RAP MPS)...');

      if (progress >= 100) {
        clearInterval(interval);
        saveEvaluationToFirestore();
      }
    }, 120);
  };

  // Guardar evaluación en Firestore y mostrar resultados (Paso 7)
  const saveEvaluationToFirestore = async () => {
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'evaluaciones'), {
        ...formData,
        fecha: new Date().toISOString(),
        createdAt: serverTimestamp(),
        origen: 'web_onboarding'
      });
      setEvaluationId(docRef.id);
    } catch (e) {
      console.warn('Evaluación guardada localmente:', e);
    } finally {
      setSaving(false);
      setStep(7);
      window.scrollTo({ top: 80, behavior: 'smooth' });
    }
  };

  // Diagnóstico pedagógico generado según respuestas
  const getProfileDiagnosis = () => {
    const instName = INSTRUMENTS_OPTIONS.find(i => i.id === formData.instrumento)?.name || 'Música';
    let profileTag = 'Intérprete Creativo';
    let programRecommended = 'mps-stage';
    let programTitle = 'MPS STAGE (Instrumento + Ensamble)';
    let modalityRecommended = formData.modalidad === 'domicilio' ? 'MPS One a Domicilio' : 'MPS Link Semipersonalizado';

    if (formData.instrumento === 'actuacion') {
      profileTag = 'Actor y Creador Escénico';
      programRecommended = 'taller-actuacion';
      programTitle = 'Taller de Actuación MPS';
    } else if (formData.instrumento === 'produccion') {
      profileTag = 'Productor Musical & Sound Designer';
      programRecommended = 'mps-producer';
      programTitle = 'MPS PRODUCER (Producción de Audio)';
    } else if (formData.objetivoPrincipal === 'satisfaccion-personal' || formData.modalidad === 'domicilio') {
      profileTag = 'Músico Personalizado (1 a 1)';
      programRecommended = 'curso-libre';
      programTitle = 'MPS One (Clase Individual Personalizada)';
    } else if (formData.objetivoPrincipal === 'preuniversitario') {
      profileTag = 'Aspirante Superior de Alto Rendimiento';
      programRecommended = 'mps-pre-universitario';
      programTitle = 'Pre-Universitario Musical MPS';
    }

    return {
      profileTag,
      programRecommended,
      programTitle,
      modalityRecommended,
      instName
    };
  };

  const diagnosis = getProfileDiagnosis();

  // Construir link hacia /checkout con datos precargados
  const getCheckoutLink = () => {
    const params = new URLSearchParams({
      program: diagnosis.programRecommended,
      instrument: formData.instrumento,
      name: formData.nombre,
      phone: formData.telefono,
      email: formData.email,
      modality: formData.modalidad === 'domicilio' ? 'individual' : 'grupal',
      location: formData.modalidad === 'domicilio' ? 'domicilio' : 'sede'
    });
    return `/checkout?${params.toString()}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      <HeaderV3 />

      <main style={{ flex: 1, padding: '2rem 1rem 5rem 1rem', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
        
        {/* ENCABEZADO Y BARRA DE PROGRESO (PASOS 1 AL 5) */}
        {step <= 5 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Diagnóstico de Nivelación y Ruta RAP MPS
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Paso {step} de 5
              </span>
            </div>

            {/* Barra de Progreso */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${(step / 5) * 100}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #00DE85, #38bdf8)', 
                  transition: 'width 0.3s ease' 
                }} 
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 1: DATOS PERSONALES Y CONTACTO
        ========================================================================= */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '1.8rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 222, 133, 0.1)', color: 'var(--accent)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.6rem' }}>
                <Sparkles size={14} /> Evaluación Inicial • Escuela MPS
              </div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
                Empecemos por conocerte: <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>¿quién va a aprender?</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                Esta información nos permite personalizar tu evaluación y asignar el docente ideal para tu edad y nivel.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Nombre completo del estudiante <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Valentina Morales"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', background: 'var(--bg-primary)', border: formErrors.nombre ? '1.5px solid #ef4444' : '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '1rem' }}
                />
                {formErrors.nombre && <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'block' }}>{formErrors.nombre}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Edad del estudiante <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ej. 14"
                    value={formData.edad}
                    onChange={(e) => handleChange('edad', e.target.value)}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', background: 'var(--bg-primary)', border: formErrors.edad ? '1.5px solid #ef4444' : '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '1rem' }}
                  />
                  {formErrors.edad && <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'block' }}>{formErrors.edad}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Acudiente o responsable
                  </label>
                  <input
                    type="text"
                    placeholder="Si es menor de edad"
                    value={formData.acudiente}
                    onChange={(e) => handleChange('acudiente', e.target.value)}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '1rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Celular o WhatsApp <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 300 123 4567"
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', background: 'var(--bg-primary)', border: formErrors.telefono ? '1.5px solid #ef4444' : '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '1rem' }}
                  />
                  {formErrors.telefono && <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'block' }}>{formErrors.telefono}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', background: 'var(--bg-primary)', border: formErrors.email ? '1.5px solid #ef4444' : '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '1rem' }}
                  />
                  {formErrors.email && <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'block' }}>{formErrors.email}</span>}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 2: INSTRUMENTO Y MODALIDAD
        ========================================================================= */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '1.8rem' }}>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
                ¿Cuál es tu instrumento o <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>área de interés?</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                Selecciona la cátedra que deseas aprender o perfeccionar en Escuela MPS.
              </p>
            </div>

            {/* Grid de Instrumentos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem', marginBottom: '2rem' }}>
              {INSTRUMENTS_OPTIONS.map((inst) => {
                const isSelected = formData.instrumento === inst.id;
                return (
                  <div
                    key={inst.id}
                    onClick={() => handleChange('instrumento', inst.id)}
                    style={{
                      background: isSelected ? 'rgba(0, 222, 133, 0.12)' : 'var(--bg-secondary)',
                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                      borderRadius: '14px',
                      padding: '1.2rem 1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.8rem' }}>{inst.icon}</span>
                      {isSelected && <CheckCircle2 size={18} color="var(--accent)" />}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {inst.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {inst.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selector de Modalidad */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1.4rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                ¿En qué modalidad prefieres tus clases?
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                {[
                  { id: 'sede', title: '🏢 En Sede Bogotá', desc: 'Salas insonorizadas, instrumentos reales e interacción con otros alumnos' },
                  { id: 'domicilio', title: '🏠 A Domicilio (Home)', desc: 'Profesor certificado en tu residencia con tu propio horario' },
                  { id: 'virtual', title: '💻 Virtual Sincrónica', desc: 'Clase en vivo 1 a 1 por videollamada con seguimiento en tiempo real' }
                ].map(mod => {
                  const isSel = formData.modalidad === mod.id;
                  return (
                    <div
                      key={mod.id}
                      onClick={() => handleChange('modalidad', mod.id)}
                      style={{
                        background: isSel ? 'rgba(0, 222, 133, 0.12)' : 'var(--bg-primary)',
                        border: isSel ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        padding: '1rem',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isSel ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '0.3rem' }}>
                        {mod.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {mod.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            PASO 3: GUSTOS MUSICALES Y ARTISTAS
        ========================================================================= */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '1.8rem' }}>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
                La música que te inspira: <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>¿qué te gusta escuchar?</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                En Escuela MPS aprendes con la música que amas. Selecciona tus géneros favoritos:
              </p>
            </div>

            {/* Nube de Chips de Géneros */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2rem' }}>
              {GENRES_OPTIONS.map(genre => {
                const isSelected = formData.gustosGeneros.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleToggleGenre(genre)}
                    style={{
                      background: isSelected ? 'var(--accent)' : 'var(--bg-secondary)',
                      color: isSelected ? '#000f11' : 'var(--text-primary)',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                      padding: '0.65rem 1.1rem',
                      borderRadius: '25px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected ? `✓ ${genre}` : `+ ${genre}`}
                  </button>
                );
              })}
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1.6rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                Artistas, bandas o canciones que sueñas tocar / cantar:
              </label>
              <textarea
                rows={3}
                placeholder="Ej. Queen, Coldplay, Adele, Fito Páez, Gustavo Cerati, Beéle, o canciones específicas..."
                value={formData.artistasFavoritos}
                onChange={(e) => handleChange('artistasFavoritos', e.target.value)}
                style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.95rem', resize: 'vertical' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'block' }}>
                Tu profesor asignado preparará tus primeras sesiones con base en este repertorio.
              </span>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 4: DIAGNÓSTICO RÍTMICO, MELÓDICO Y MEMORIA (DEL GOOGLE FORM)
        ========================================================================= */}
        {step === 4 && (
          <div>
            <div style={{ marginBottom: '1.8rem' }}>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
                Diagnóstico inicial: <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>¿cómo sientes el ritmo y el oído?</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                Sé totalmente sincero. No hay respuestas correctas o incorrectas; esto calibra el punto de partida exacto de tu Ruta.
              </p>
            </div>

            {/* Pregunta 1: Ritmo */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                1. ¿Cómo te desenvuelves con el pulso y el ritmo?
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem' }}>
                {[
                  { id: 'cero', label: 'Estoy desde cero', desc: 'Me cuesta llevar el pulso constante o coordinar con la música' },
                  { id: 'basico', label: 'Llevo el ritmo con palmas o la voz', desc: 'Puedo seguir una canción y repetir un patrón sencillo' },
                  { id: 'intermedio', label: 'Reconozco figuras rítmicas', desc: 'Sé identificar compases básicos (4/4, 3/4) y cambios de tempo' },
                  { id: 'avanzado', label: 'Domino lectura rítmica fluida', desc: 'Síncopas, contratiempos y métricas compuestas' }
                ].map(r => {
                  const isSel = formData.nivelRitmo === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleChange('nivelRitmo', r.id)}
                      style={{
                        background: isSel ? 'rgba(0, 222, 133, 0.12)' : 'var(--bg-primary)',
                        border: isSel ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isSel ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {r.label}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{r.desc}</div>
                      </div>
                      {isSel && <CheckCircle2 size={18} color="var(--accent)" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pregunta 2: Melodía y Entonación */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                2. ¿Cómo percibes las notas musicales y la melodía?
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem' }}>
                {[
                  { id: 'cero', label: 'Afinación / Melodía desde cero', desc: 'Aún no reconozco si una nota es más aguda o grave' },
                  { id: 'basico', label: 'Entono melodías sencillas de oído', desc: 'Canto o tarareo canciones con afinación aceptable' },
                  { id: 'intermedio', label: 'Conozco la escala de Do y notas básicas', desc: 'Ubico notas en el teclado/mástil y reconozco acordes mayores y menores' },
                  { id: 'avanzado', label: 'Leo partitura o cifrado americano', desc: 'Puedo interpretar una melodía escrita en pentagrama' }
                ].map(m => {
                  const isSel = formData.nivelMelodia === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleChange('nivelMelodia', m.id)}
                      style={{
                        background: isSel ? 'rgba(0, 222, 133, 0.12)' : 'var(--bg-primary)',
                        border: isSel ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isSel ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {m.label}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{m.desc}</div>
                      </div>
                      {isSel && <CheckCircle2 size={18} color="var(--accent)" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pregunta 3: Sección 2.3 Memoria (Visual, Motora, Auditiva) */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                3. ¿Qué canal de aprendizaje te resulta más natural?
              </label>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>
                Selecciona cómo recuerdas mejor la música y los ejercicios:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
                {[
                  { id: 'auditiva', title: '👂 Auditivo', desc: 'Aprendo escuchando la canción y repitiendo de oído' },
                  { id: 'visual', title: '👁️ Visual', desc: 'Aprendo viendo videos, diagramas, esquemas o partituras' },
                  { id: 'motora', title: '✋ Corporal / Motriz', desc: 'Aprendo con la memoria física de los dedos y repetición' }
                ].map(mem => {
                  const isSel = formData.memoriaAuditiva === mem.id || (mem.id === 'auditiva' && formData.memoriaAuditiva === 'buena');
                  return (
                    <div
                      key={mem.id}
                      onClick={() => {
                        handleChange('memoriaAuditiva', mem.id);
                        handleChange('memoriaVisual', mem.id);
                        handleChange('memoriaMotora', mem.id);
                      }}
                      style={{
                        background: isSel ? 'rgba(0, 222, 133, 0.12)' : 'var(--bg-primary)',
                        border: isSel ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        padding: '1rem',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSel ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '0.3rem' }}>
                        {mem.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {mem.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            PASO 5: METAS, MOTIVACIONES Y COMPROMISO (DEL GOOGLE FORM)
        ========================================================================= */}
        {step === 5 && (
          <div>
            <div style={{ marginBottom: '1.8rem' }}>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
                Tus metas en MPS: <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>¿qué quieres lograr?</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                El objetivo final es que vivas la música en el escenario o en tu vida cotidiana.
              </p>
            </div>

            {/* Metas Principales */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem', marginBottom: '2rem' }}>
              {[
                { id: 'tocar-en-vivo', icon: '⭐', title: 'Vivir la experiencia de tarima (MPS STAGE)', desc: 'Tocar o cantar en ensamble grupal con banda y presentarme en vivo en el auditorio oficial' },
                { id: 'satisfaccion-personal', icon: '🎵', title: 'Aprender mi instrumento por hobby y bienestar', desc: 'Desconectarme del trabajo/estudio y disfrutar de tocar mis canciones preferidas a mi propio ritmo' },
                { id: 'vencer-miedo', icon: '💪', title: 'Superar el pánico escénico y ganar seguridad', desc: 'Desarrollar proyección de voz, control corporal y confianza ante cualquier público' },
                { id: 'preuniversitario', icon: '🎓', title: 'Preparación para audición universitaria', desc: 'Nivelación intensiva en gramática, armonía y técnica para ingresar a educación superior' },
                { id: 'produccion', icon: '🎧', title: 'Producir mis propias canciones y pistas', desc: 'Aprender grabación, edición y mezcla para subir canciones profesionales a Spotify' }
              ].map(obj => {
                const isSel = formData.objetivoPrincipal === obj.id;
                return (
                  <div
                    key={obj.id}
                    onClick={() => handleChange('objetivoPrincipal', obj.id)}
                    style={{
                      background: isSel ? 'rgba(0, 222, 133, 0.12)' : 'var(--bg-secondary)',
                      border: isSel ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      padding: '1.1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ fontSize: '1.6rem' }}>{obj.icon}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isSel ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {obj.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                          {obj.desc}
                        </div>
                      </div>
                    </div>
                    {isSel && <CheckCircle2 size={20} color="var(--accent)" />}
                  </div>
                );
              })}
            </div>

            {/* Disponibilidad de tiempo */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1.4rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                ¿Cuántas horas semanales puedes dedicarle al instrumento?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                {[
                  { id: '1-a-2', label: '1 a 2 h/semana', desc: 'Ritmo suave' },
                  { id: '3-a-5', label: '3 a 5 h/semana', desc: 'Progreso ideal' },
                  { id: 'mas-5', label: '+5 h/semana', desc: 'Alto rendimiento' }
                ].map(h => {
                  const isSel = formData.horasPracticaSemana === h.id;
                  return (
                    <div
                      key={h.id}
                      onClick={() => handleChange('horasPracticaSemana', h.id)}
                      style={{
                        background: isSel ? 'rgba(0, 222, 133, 0.12)' : 'var(--bg-primary)',
                        border: isSel ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                        borderRadius: '10px',
                        padding: '0.8rem',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isSel ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {h.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{h.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            PASO 6: ANIMACIÓN "LABOR ILLUSION" (CALCULANDO RUTA RAP)
        ========================================================================= */}
        {step === 6 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(0, 222, 133, 0.1)',
              border: '2px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Sparkles size={36} color="var(--accent)" />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.6rem' }}>
              Generando tu Ruta de Aprendizaje Personalizada
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              {calcStatusText}
            </p>

            {/* Barra animada de porcentaje */}
            <div style={{ maxWidth: '400px', margin: '0 auto 2.5rem auto' }}>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${calcProgress}%`, height: '100%', background: 'linear-gradient(90deg, #00DE85, #38bdf8)', transition: 'width 0.15s ease' }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.4rem' }}>
                {calcProgress}%
              </div>
            </div>

            {/* Checklist de verificación */}
            <div style={{ maxWidth: '360px', margin: '0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: calcProgress >= 25 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                <CheckCircle2 size={18} /> Perfil auditivo y rítmico calibrado
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: calcProgress >= 50 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                <CheckCircle2 size={18} /> Cátedra y metodología asignada
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: calcProgress >= 75 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                <CheckCircle2 size={18} /> Repertorio inicial seleccionado
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: calcProgress >= 100 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                <CheckCircle2 size={18} /> Ficha de Ruta RAP MPS lista
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 7: RESULTADOS Y PUENTE AL CHECKOUT
        ========================================================================= */}
        {step === 7 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 222, 133, 0.15)', color: 'var(--accent)', padding: '0.35rem 0.9rem', borderRadius: '25px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                ✓ Evaluación Completada con Éxito
              </div>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 900, margin: '0 0 0.5rem 0' }}>
                ¡{formData.nombre.split(' ')[0]}, aquí está tu <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Ruta Musical!</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                Basado en tu diagnóstico rítmico, gustos y metas, este es tu perfil oficial en Escuela MPS:
              </p>
            </div>

            {/* FICHA TÉCNICA DEL ESTUDIANTE */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: '20px',
              border: '1.5px solid var(--accent)',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0, 222, 133, 0.08)',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.2rem', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Perfil Artístico Detectado:
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent)', marginTop: '0.2rem' }}>
                    {diagnosis.profileTag}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Cátedra Asignada:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {diagnosis.instName}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Programa Recomendado:
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {diagnosis.programTitle}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Modalidad Óptima:
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {diagnosis.modalityRecommended}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Géneros para Repertorio:
                  </span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {formData.gustosGeneros.slice(0, 3).join(', ')}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(0, 222, 133, 0.05)', borderRadius: '10px', padding: '1rem 1.2rem', border: '1px solid rgba(0, 222, 133, 0.2)', fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                <strong>Plan Pedagógico Inicial:</strong> Durante tus primeras 4 semanas desarrollarás postura, digitación/respiración técnica sin tensión y montaje de tus primeras 2 canciones de repertorio bajo la supervisión de tu docente asignado en MPS.
              </div>
            </div>

            {/* BOTONES DE ACCIÓN: PUENTE AL CHECKOUT O WHATSAPP */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <Link
                href={getCheckoutLink()}
                style={{
                  background: 'var(--accent)',
                  color: '#000f11',
                  padding: '1.1rem',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 4px 20px rgba(0, 222, 133, 0.3)'
                }}
              >
                Continuar a Matrícula y Pago ({diagnosis.programTitle}) <ArrowRight size={20} />
              </Link>

              <a
                href={`https://wa.me/573008934407?text=${encodeURIComponent(`¡Hola Escuela MPS! Acabo de completar mi Evaluación Inicial en la web.\n\n*Nombre:* ${formData.nombre}\n*Instrumento:* ${diagnosis.instName}\n*Perfil:* ${diagnosis.profileTag}\n*Programa Sugerido:* ${diagnosis.programTitle}\n\nQuisiera resolver dudas antes de matricularme.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  padding: '0.9rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Phone size={16} /> Compartir Diagnóstico por WhatsApp con Coordinación
              </a>
            </div>

            {/* Sellos de Confianza y Garantía en Pantalla de Resultados */}
            <TrustBadges />

          </div>
        )}

        {/* BOTONES DE NAVEGACIÓN (PASOS 1 AL 5) */}
        {step <= 5 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)',
                    padding: '0.75rem 1.4rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <ArrowLeft size={16} /> Anterior
                </button>
              ) : (
                <Link
                  href="/cursos"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <ArrowLeft size={14} /> Volver a Cursos
                </Link>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                style={{
                  background: 'var(--accent)',
                  color: '#000f11',
                  border: 'none',
                  padding: '0.75rem 1.8rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(0, 222, 133, 0.25)'
                }}
              >
                {step === 5 ? 'Generar Mi Ruta RAP 🚀' : 'Siguiente Paso →'}
              </button>
            </div>

            {/* Sellos de Confianza sutiles en la parte inferior de los pasos 1 al 5 */}
            <TrustBadges compact={true} />
          </>
        )}

      </main>

      <FooterV3 />
    </div>
  );
}

export default function EvaluacionPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--accent)' }}>Cargando evaluación...</div>}>
      <EvaluacionContent />
    </Suspense>
  );
}
