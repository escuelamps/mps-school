"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Copy, 
  Check, 
  CreditCard, 
  Smartphone, 
  HelpCircle, 
  ArrowRight, 
  Sparkles,
  QrCode,
  Building2,
  FileCheck2,
  AlertCircle,
  Search,
  Calendar,
  Clock,
  Users,
  Music
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import './checkout.css';

// 5 PROGRAMAS ACADÉMICOS OFICIALES MPS (SEGÚN DOCUMENTOS CURRICULARES E INFOGRAFÍAS)
const OFFICIAL_PROGRAMS = {
  'curso-libre': {
    id: 'curso-libre',
    title: 'Curso Libre de Instrumento',
    category: 'Formación Instrumental Continua',
    badge: 'CURSO LIBRE OFICIAL MPS',
    tagline: 'Tu instrumento. Tu proceso. Tu música.',
    duration: 'Ciclo Trimestral Renovable • 2 a 4 alumnos (Link) o 1 a 1 (One)',
    presentation: 'Recital y muestra semestral en auditorio oficial MPS',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    linkPrice: 230000,
    onePrice: 320000,
    homePrice: 380000,
    originalLink: 250000,
    originalOne: 350000,
    components: [
      { name: 'Modalidad MPS LINK (Grupal Semipersonalizado)', hours: '2 h/semana', format: '2 a 4 alumnos del mismo instrumento • Horario trimestral fijo' },
      { name: 'Modalidad MPS ONE (Personalizado 1 a 1)', hours: '1 h/semana', format: '1 estudiante individual • Avance a tu propio ritmo' },
      { name: 'Modalidad MPS HOME (A Domicilio)', hours: '1 h/semana', format: 'Clase en tu residencia con docente asignado MPS' }
    ]
  },
  'mps-stage': {
    id: 'mps-stage',
    title: 'MPS STAGE (Instrumento + Ensamble)',
    category: 'Programa de Formación Musical • Semestral',
    badge: 'PROGRAMA DE FORMACIÓN MUSICAL',
    tagline: 'Aprende tu instrumento. Toca con otros. Sube al Stage.',
    duration: '16 Semanas por semestre • 3 horas semanales • 48 Horas en total',
    presentation: 'Presentación final del semestre según programación institucional',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80',
    linkPrice: 280000,
    onePrice: 380000,
    originalLink: 320000,
    originalOne: 420000,
    components: [
      { name: 'Instrumento Personalizado', hours: '1 h/semana', format: 'Clase individual 1 estudiante • Técnica, lenguaje musical y repertorio' },
      { name: 'Ensamble Musical Grupal', hours: '2 h/semana', format: 'Trabajo colectivo 3 a 8 estudiantes • Escucha activa, roles y montaje en vivo' }
    ]
  },
  'mps-producer': {
    id: 'mps-producer',
    title: 'MPS PRODUCER (Producción de Audio)',
    category: 'Programa Especializado • Tecnología Sonora',
    badge: 'PROGRAMA ESPECIALIZADO DE AUDIO',
    tagline: 'De tus ideas a canciones reales.',
    duration: '1 Año académico (2 semestres de 16 semanas) • 2 h/semana • Máx 6 alumnos',
    presentation: 'Semestre 1: Demo básico | Semestre 2: Proyecto final + muestra pública',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80',
    linkPrice: 320000,
    onePrice: 420000,
    originalLink: 350000,
    originalOne: 460000,
    components: [
      { name: 'Teoría Grupal + Práctica Individual', hours: '2 h/semana', format: '5 Módulos: DAW, microfonía, edición, mezcla/máster y dirección' },
      { name: 'Sesiones en Estudio Aliado', hours: 'Estudios Pro', format: 'Mínimo 2 sesiones (Sem 1) y 3 sesiones (Sem 2) en estudio comercial' }
    ]
  },
  'mps-prep': {
    id: 'mps-prep',
    title: 'MPS PREP (Preuniversitario Musical)',
    category: 'Admisiones Universidad • Alto Rendimiento',
    badge: 'PROGRAMA PREUNIVERSITARIO MUSICAL',
    tagline: 'Prepara tu música. Profundiza tu lenguaje. Da el siguiente paso.',
    duration: '1 Semestre académico (16 semanas) • 15 h/semana • 240 Horas estimadas',
    presentation: 'Audición de simulacro y preparación intensiva de admisión universitaria',
    image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&q=80',
    linkPrice: 450000,
    onePrice: 580000,
    originalLink: 490000,
    originalOne: 650000,
    components: [
      { name: 'Instrumento Principal', hours: '1 h/sem', format: 'Desarrollo técnico e interpretativo de repertorio avanzado' },
      { name: 'Teclado Complementario', hours: '2 h/sem', format: 'Aplicación musical desde el teclado y armonía funcional' },
      { name: 'Ensamble Colectivo', hours: '2 h/sem', format: 'Interpretación en grupo y desarrollo de la escucha activa' },
      { name: 'Gramática y Audio', hours: '6 h/sem', format: 'Lectura rítmico-melódica, escalas, intervalos y dictado' },
      { name: 'Teoría Musical', hours: '4 h/sem', format: 'Fundamentos armónicos y conceptos musicales aplicados' }
    ]
  },
  'mps-music-camp': {
    id: 'mps-music-camp',
    title: 'MPS MUSIC CAMP (Temporada Intensiva)',
    category: 'Temporada Vacacional • Niños y Jóvenes',
    badge: 'TEMPORADA VACACIONAL INTENSIVA',
    tagline: 'Aprender, crear, ensayar, presentar.',
    duration: '2 Semanas (10 días Lunes a Viernes) • 2 h/día • 20 Horas totales',
    presentation: 'Muestra escénica final en auditorio ante familiares',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    linkPrice: 290000,
    onePrice: 390000,
    originalLink: 330000,
    originalOne: 440000,
    components: [
      { name: 'Instrumento Semipersonalizado', hours: '8 Horas', format: 'Técnica, postura, ejercicios y montaje de repertorio' },
      { name: 'Ensamble Musical en Vivo', hours: '8 Horas', format: 'Pulso colectivo, escucha, interacción y dinamismo grupal' },
      { name: 'Taller Corporal y Performance', hours: '4 Horas', format: 'Expresión corporal, presencia escénica y desinhibición' }
    ]
  },
  matricula: {
    id: 'matricula',
    title: 'Matrícula Anual Institucional',
    category: 'Registro Oficial MPS',
    badge: 'REGISTRO INSTITUCIONAL',
    tagline: 'Tu carné, reserva de salas y beneficios exclusivos de estudiante.',
    duration: 'Vigencia Anual (12 Meses)',
    presentation: 'Carné oficial con convenios Yamaha y aliados',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80',
    linkPrice: 120000,
    onePrice: 120000,
    originalLink: 150000,
    originalOne: 150000,
    components: [
      { name: 'Carné Institucional', hours: 'Oficial', format: 'Código de estudiante y convenios' },
      { name: 'Reserva de Salas de Ensayo', hours: 'Ilimitada', format: 'Espacios insonorizados equipados' }
    ]
  }
};

// LISTA DE INSTRUMENTOS FORMALES
const INSTRUMENTS_LIST = [
  { id: 'canto', name: 'Técnica Vocal y Canto' },
  { id: 'piano', name: 'Piano y Teclados' },
  { id: 'guitarra', name: 'Guitarra (Acústica y Eléctrica)' },
  { id: 'violin', name: 'Violín y Cuerdas Clásicas' },
  { id: 'bateria', name: 'Batería y Percusión' },
  { id: 'bajo', name: 'Bajo Eléctrico' },
  { id: 'actuacion', name: 'Actuación y Expresión Escénica' }
];

// HORARIOS GRUPALES TRIMESTRALES (DE LA LIBRETA MANUSCRITA OFICIAL)
const GROUP_SCHEDULES = {
  canto: [
    { id: 'canto-mie-4-6', label: 'Miércoles 4:00 pm - 6:00 pm (Técnica Vocal)' },
    { id: 'canto-mie-6-8', label: 'Miércoles 6:00 pm - 8:00 pm (Técnica Vocal)' },
    { id: 'canto-mie-7-9', label: 'Miércoles 7:00 pm - 9:00 pm (Canto Nocturno)' },
    { id: 'canto-jue-7-9', label: 'Jueves 7:00 pm - 9:00 pm (Canto Nocturno)' },
    { id: 'canto-sab-11-1', label: 'Sábado 11:00 am - 1:00 pm (Canto Grupal)' },
  ],
  guitarra: [
    { id: 'guit-jue-6-8', label: 'Jueves 6:00 pm - 8:00 pm (Guitarra Grupal)' },
    { id: 'guit-vie-4-6', label: 'Viernes 4:00 pm - 6:00 pm (Guitarra Grupal)' },
    { id: 'guit-sab-2-4', label: 'Sábado 2:00 pm - 4:00 pm (Guitarra Grupal)' },
  ],
  piano: [
    { id: 'piano-vie-4-6', label: 'Viernes 4:00 pm - 6:00 pm (Piano y Teclados)' },
    { id: 'piano-vie-6-8', label: 'Viernes 6:00 pm - 8:00 pm (Piano y Teclados)' },
    { id: 'piano-sab-8-10', label: 'Sábado 8:00 am - 10:00 am (Piano Matutino)' },
    { id: 'piano-sab-10-12', label: 'Sábado 10:00 am - 12:00 m (Piano Medio Día)' },
  ],
  violin: [
    { id: 'viol-jue-4-6', label: 'Jueves 4:00 pm - 6:00 pm (Violín y Cuerdas)' },
    { id: 'viol-jue-6-8', label: 'Jueves 6:00 pm - 8:00 pm (Violín y Cuerdas)' },
    { id: 'viol-vie-6-8', label: 'Viernes 6:00 pm - 8:00 pm (Violín y Cuerdas)' },
  ],
  actuacion: [
    { id: 'act-mie-6-8', label: 'Miércoles 6:00 pm - 8:00 pm (Teatro Jóvenes y Adultos)' },
    { id: 'act-sab-10-12', label: 'Sábado 10:00 am - 12:00 m (Teatro Niños y Expresión)' },
  ],
  bateria: [
    { id: 'bat-mie-4-6', label: 'Miércoles 4:00 pm - 6:00 pm (Percusión y Ritmo)' },
    { id: 'bat-sab-2-4', label: 'Sábado 2:00 pm - 4:00 pm (Percusión y Ritmo)' },
  ],
  bajo: [
    { id: 'bajo-jue-6-8', label: 'Jueves 6:00 pm - 8:00 pm (Bajo y Ensamble)' },
    { id: 'bajo-sab-2-4', label: 'Sábado 2:00 pm - 4:00 pm (Bajo y Ensamble)' },
  ],
  'mps-stage': [
    { id: 'stage-mie-4-7', label: 'Miércoles 4:00 pm - 7:00 pm (Instrumento + Ensamble)' },
    { id: 'stage-jue-4-7', label: 'Jueves 4:00 pm - 7:00 pm (Instrumento + Ensamble)' },
    { id: 'stage-sab-9-12', label: 'Sábado 9:00 am - 12:00 m (Instrumento + Ensamble)' },
    { id: 'stage-sab-2-5', label: 'Sábado 2:00 pm - 5:00 pm (Instrumento + Ensamble)' },
  ],
  'mps-producer': [
    { id: 'prod-mie-6-8', label: 'Miércoles 6:00 pm - 8:00 pm (Teoría + Práctica DAW)' },
    { id: 'prod-sab-10-12', label: 'Sábado 10:00 am - 12:00 m (Producción y Grabación)' },
    { id: 'prod-sab-2-4', label: 'Sábado 2:00 pm - 4:00 pm (Mezcla y Máster)' },
  ],
  'mps-prep': [
    { id: 'prep-mat-8-11', label: 'Lunes a Viernes 8:00 am - 11:00 am (15h/sem Matutino)' },
    { id: 'prep-ves-2-5', label: 'Lunes a Viernes 2:00 pm - 5:00 pm (15h/sem Vespertino)' },
  ],
  'mps-music-camp': [
    { id: 'camp-mat-9-11', label: 'Lunes a Viernes 9:00 am - 11:00 am (Temporada Vacacional)' },
    { id: 'camp-tar-2-4', label: 'Lunes a Viernes 2:00 pm - 4:00 pm (Temporada Vacacional)' },
    { id: 'camp-tar-4-6', label: 'Lunes a Viernes 4:00 pm - 6:00 pm (Temporada Vacacional)' },
  ]
};

function CheckoutContent() {
  const searchParams = useSearchParams();

  // Estados del formulario del comprador
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [telefono, setTelefono] = useState('');
  const [docId, setDocId] = useState('');

  // Selección de programa e instrumento
  const [selectedProgramKey, setSelectedProgramKey] = useState('mps-stage');
  const [selectedInstrument, setSelectedInstrument] = useState('canto');
  const [modality, setModality] = useState('grupal'); // 'grupal' (MPS Link) | 'individual' (MPS One)
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [customAmount, setCustomAmount] = useState(null);
  const [customTitle, setCustomTitle] = useState(null);

  // Order Bump (Kit de Bienvenida)
  const [includeKit, setIncludeKit] = useState(false);
  const KIT_PRICE = 35000;

  // Método de pago: 'bold' (por defecto) | 'nequi' (desplegable)
  const [paymentMethod, setPaymentMethod] = useState('bold');

  // Nequi estados
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [comprobanteFile, setComprobanteFile] = useState(null);

  // Estados de proceso
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [successOrder, setSuccessOrder] = useState(null);

  // Cupón de descuento
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Leer query params al cargar
  useEffect(() => {
    const courseParam = searchParams.get('course') || searchParams.get('c');
    const programParam = searchParams.get('program') || searchParams.get('p');
    const amountParam = searchParams.get('amount');
    const titleParam = searchParams.get('title');
    const modalityParam = searchParams.get('modality') || searchParams.get('m');

    const key = (programParam || courseParam || '').toLowerCase();
    
    if (key === 'stage' || key === 'mps-stage') {
      setSelectedProgramKey('mps-stage');
    } else if (key === 'producer' || key === 'produccion' || key === 'mps-producer') {
      setSelectedProgramKey('mps-producer');
    } else if (key === 'prep' || key === 'mps-prep') {
      setSelectedProgramKey('mps-prep');
    } else if (key === 'music-camp' || key === 'camp' || key === 'mps-music-camp') {
      setSelectedProgramKey('mps-music-camp');
    } else if (key === 'matricula') {
      setSelectedProgramKey('matricula');
    } else if (key && INSTRUMENTS_LIST.some(i => i.id === key)) {
      setSelectedProgramKey('curso-libre');
      setSelectedInstrument(key);
    } else if (OFFICIAL_PROGRAMS[key]) {
      setSelectedProgramKey(key);
    }

    if (modalityParam === 'individual' || modalityParam === '1a1' || modalityParam === 'personalizado') {
      setModality('individual');
    }

    if (amountParam && !isNaN(Number(amountParam))) {
      setCustomAmount(Number(amountParam));
    }
    if (titleParam) {
      setCustomTitle(decodeURIComponent(titleParam));
    }
  }, [searchParams]);

  // Actualizar horario predeterminado según el programa o instrumento
  useEffect(() => {
    const scheduleKey = (selectedProgramKey === 'curso-libre' || selectedProgramKey === 'mps-stage') 
      ? selectedInstrument 
      : selectedProgramKey;

    const schedules = GROUP_SCHEDULES[scheduleKey] || GROUP_SCHEDULES['mps-stage'] || [];
    if (schedules && schedules.length > 0) {
      setSelectedSchedule(schedules[0].label);
    } else {
      setSelectedSchedule('');
    }
  }, [selectedProgramKey, selectedInstrument, modality]);

  const activeProgram = OFFICIAL_PROGRAMS[selectedProgramKey] || OFFICIAL_PROGRAMS['mps-stage'];
  const isMatricula = selectedProgramKey === 'matricula';
  const hasInstrumentChoice = selectedProgramKey === 'curso-libre' || selectedProgramKey === 'mps-stage';

  const currentPrice = isMatricula ? activeProgram.linkPrice : (modality === 'individual' ? activeProgram.onePrice : activeProgram.linkPrice);
  const currentOriginal = isMatricula ? activeProgram.originalLink : (modality === 'individual' ? activeProgram.originalOne : activeProgram.originalLink);
  const basePrice = customAmount !== null ? customAmount : currentPrice;

  const instrumentLabel = hasInstrumentChoice ? ` (${INSTRUMENTS_LIST.find(i => i.id === selectedInstrument)?.name || selectedInstrument})` : '';
  const modalityLabel = isMatricula ? '' : (modality === 'individual' ? ' - MPS One (Individual)' : ' - MPS Link (Grupal Trimestral)');
  const productTitle = (customTitle || activeProgram.title) + instrumentLabel + modalityLabel;

  const discountAmount = customAmount !== null ? 0 : (currentOriginal - currentPrice);
  const couponDiscount = appliedCoupon ? (Number(appliedCoupon.valor) || 0) : 0;
  const totalPrice = Math.max(0, basePrice + (includeKit ? KIT_PRICE : 0) - couponDiscount);

  // Horarios disponibles para el programa/instrumento activo
  const activeSchedulesKey = hasInstrumentChoice ? selectedInstrument : selectedProgramKey;
  const activeSchedules = GROUP_SCHEDULES[activeSchedulesKey] || GROUP_SCHEDULES[selectedProgramKey] || [];

  // Formato de moneda COP
  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  // Copiar al portapapeles
  const handleCopy = (text, type) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      if (type === 'key') {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2500);
      } else if (type === 'phone') {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2500);
      }
    }
  };

  // Validación y aplicación de cupón
  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const q = query(
        collection(db, 'cupones_descuento'),
        where('codigo', '==', couponCode.trim().toUpperCase()),
        where('estado', '==', 'ACTIVO')
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setCouponError('Cupón inválido o ya ha expirado.');
        setAppliedCoupon(null);
      } else {
        const cupDoc = snapshot.docs[0];
        const data = cupDoc.data();
        setAppliedCoupon({ id: cupDoc.id, ...data });
        setCouponError('');
      }
    } catch (err) {
      console.error('Error validando cupón:', err);
      setCouponError('No se pudo validar el cupón en este momento.');
    } finally {
      setCouponLoading(false);
    }
  };

  // Manejo del Submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!nombre.trim()) errors.nombre = 'Ingresa tu nombre completo';
    if (!email.trim() || !email.includes('@')) errors.email = 'Ingresa un correo válido';
    if (email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
      errors.emailConfirm = 'Los correos no coinciden';
    }
    if (!telefono.trim() || telefono.length < 7) errors.telefono = 'Ingresa un número de celular de contacto válido';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSubmitting(true);

    try {
      const orderData = {
        cliente: {
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          telefono: telefono.trim(),
          docId: docId.trim() || null
        },
        producto: {
          id: activeProgram.id,
          programa: activeProgram.title,
          instrumento: hasInstrumentChoice ? selectedInstrument : null,
          titulo: productTitle,
          categoria: activeProgram.category,
          modalidad: isMatricula ? 'institucional' : (modality === 'grupal' ? 'MPS Link (Grupal Trimestral)' : 'MPS One (Individual)'),
          horarioSeleccionado: !isMatricula && modality === 'grupal' ? (selectedSchedule || 'Grupal Trimestral - Por coordinar') : (isMatricula ? 'N/A' : 'Personalizado 1 a 1'),
          precioBase: basePrice,
          kitIncluido: includeKit,
          precioKit: includeKit ? KIT_PRICE : 0,
          cuponAplicado: appliedCoupon ? appliedCoupon.codigo : null,
          descuentoCupon: couponDiscount,
          totalCOP: totalPrice
        },
        cupon: appliedCoupon ? {
          codigo: appliedCoupon.codigo,
          descuento: appliedCoupon.valor,
          cuponId: appliedCoupon.id
        } : null,
        metodoPago: paymentMethod, // 'bold' | 'nequi'
        detallePago: paymentMethod === 'bold' 
          ? {
              pasarela: 'Bold Pagos Oficial',
              moneda: 'COP',
              monto: totalPrice
            }
          : {
              llaveBreB: '@MIPRIMERSOL',
              telefonoNequi: '3023557760',
              comprobanteAdjunto: !!comprobanteFile
            },
        estado: paymentMethod === 'bold' ? 'PENDIENTE_PAGO_BOLD' : 'PENDIENTE_VERIFICACION',
        fecha: new Date().toISOString(),
        origen: 'checkout_web_mps'
      };

      // Guardar registro en Firestore
      const docRef = await addDoc(collection(db, 'pagos_pendientes'), {
        ...orderData,
        createdAt: serverTimestamp()
      });

      // Si se aplicó un cupón, marcarlo como USADO en Firestore
      if (appliedCoupon?.id) {
        try {
          await updateDoc(doc(db, 'cupones_descuento', appliedCoupon.id), {
            estado: 'USADO',
            usadoEn: serverTimestamp(),
            usadoPor: email.trim().toLowerCase(),
            pedidoId: docRef.id
          });
        } catch (cupErr) {
          console.error('Error al actualizar estado del cupón a USADO:', cupErr);
        }
      }

      // Si es Bold, generar firma e invocar el checkout oficial de Bold
      if (paymentMethod === 'bold') {
        try {
          const resBold = await fetch('/api/checkout/bold', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: productTitle,
              price: totalPrice,
              email: email.trim().toLowerCase(),
              studentName: nombre.trim(),
              orderId: docRef.id,
              phone: telefono.trim()
            })
          });
          const boldData = await resBold.json();

          if (boldData.success && typeof window !== 'undefined' && window.BoldCheckout) {
            const checkout = new window.BoldCheckout({
              orderId: boldData.orderId,
              currency: boldData.currency,
              amount: String(boldData.amount),
              apiKey: boldData.apiKey,
              integritySignature: boldData.integritySignature,
              description: boldData.description,
              redirectionUrl: boldData.redirectionUrl
            });
            checkout.open();
            setSubmitting(false);
            return;
          }
        } catch (boldErr) {
          console.error('Error invocando pasarela Bold:', boldErr);
        }
      }

      setSuccessOrder({
        id: docRef.id,
        ...orderData
      });

    } catch (err) {
      console.error('Error al procesar el pago:', err);
      setSuccessOrder({
        id: 'MPS-' + Math.floor(100000 + Math.random() * 900000),
        cliente: { nombre, email, telefono },
        producto: { titulo: productTitle, totalCOP: totalPrice, horarioSeleccionado: selectedSchedule },
        metodoPago: paymentMethod
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hotmart-checkout-wrapper">
      
      {/* HEADER DE SEGURIDAD ESTILO HOTMART */}
      <header className="checkout-top-header">
        <div className="checkout-header-inner">
          <Link href="/cursos" className="checkout-logo-link">
            <img src="/images/logo2.png" alt="MPS Academia de Artes" className="checkout-logo-img" />
          </Link>
          <div className="checkout-security-badge">
            <ShieldCheck size={16} />
            <span>Ambiente 100% Seguro • Cifrado SSL</span>
          </div>
        </div>
      </header>

      {/* MODAL DE ÉXITO */}
      {successOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 15, 17, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent)',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '540px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 222, 133, 0.25)',
            color: 'var(--text-primary)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(0, 222, 133, 0.15)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.6rem' }}>
              ¡Inscripción Registrada!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Hola <strong>{successOrder.cliente.nombre}</strong>, hemos registrado tu solicitud de matrícula para <strong>{successOrder.producto.titulo}</strong> por valor de <strong>{formatCOP(successOrder.producto.totalCOP)}</strong>.
            </p>

            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.8rem',
              textAlign: 'left',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Referencia:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{successOrder.id}</span>
              </div>
              {successOrder.producto.horarioSeleccionado && successOrder.producto.horarioSeleccionado !== 'N/A' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Horario Asignado:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{successOrder.producto.horarioSeleccionado}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Método:</span>
                <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                  {successOrder.metodoPago === 'bold' ? 'Pago en Línea Seguro' : 'Transferencia Nequi / Bre-B'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Correo del alumno:</span>
                <span style={{ fontWeight: 700 }}>{successOrder.cliente.email}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <a 
                href={`https://wa.me/573008934407?text=${encodeURIComponent(`¡Hola MPS! Acabo de registrar mi inscripción al curso ${successOrder.producto.titulo} (Ref: ${successOrder.id}). Mi nombre es ${successOrder.cliente.nombre}.${successOrder.producto.horarioSeleccionado ? ` Mi horario seleccionado es: ${successOrder.producto.horarioSeleccionado}.` : ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25d366',
                  color: '#ffffff',
                  padding: '1rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                Notificar por WhatsApp a Coordinación
              </a>
              <Link 
                href="/cursos"
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  textDecoration: 'underline',
                  padding: '0.5rem'
                }}
              >
                Volver al catálogo de cursos
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* GRID PRINCIPAL 2 COLUMNAS */}
      <main className="checkout-main-grid">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <section className="checkout-form-column">
          <form onSubmit={handleSubmit}>
            
            {/* PASO 1: DATOS PERSONALES */}
            <div className="checkout-card" style={{ marginBottom: '1.8rem' }}>
              <div className="checkout-card-header">
                <div className="checkout-step-bubble">1</div>
                <h2 className="checkout-card-title">Tus Datos de Contacto</h2>
              </div>

              <div className="checkout-input-group">
                <label className="checkout-label">Nombre completo del estudiante o titular</label>
                <input 
                  type="text"
                  placeholder="Ej: Laura Sofía Gómez"
                  className="checkout-input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                {formErrors.nombre && (
                  <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={14} /> {formErrors.nombre}
                  </span>
                )}
              </div>

              <div className="checkout-grid-2">
                <div className="checkout-input-group">
                  <label className="checkout-label">Correo electrónico</label>
                  <input 
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    className="checkout-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {formErrors.email && (
                    <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlertCircle size={14} /> {formErrors.email}
                    </span>
                  )}
                </div>

                <div className="checkout-input-group">
                  <label className="checkout-label">Confirmar correo electrónico</label>
                  <input 
                    type="email"
                    placeholder="Repite tu correo"
                    className="checkout-input"
                    value={emailConfirm}
                    onChange={(e) => setEmailConfirm(e.target.value)}
                  />
                  {formErrors.emailConfirm && (
                    <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlertCircle size={14} /> {formErrors.emailConfirm}
                    </span>
                  )}
                </div>
              </div>

              <div className="checkout-grid-2">
                <div className="checkout-input-group">
                  <label className="checkout-label">Celular / WhatsApp (Colombia +57)</label>
                  <input 
                    type="tel"
                    placeholder="300 123 4567"
                    className="checkout-input"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                  {formErrors.telefono && (
                    <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlertCircle size={14} /> {formErrors.telefono}
                    </span>
                  )}
                </div>

                <div className="checkout-input-group">
                  <label className="checkout-label">Cédula o Tarjeta de Identidad (Opcional)</label>
                  <input 
                    type="text"
                    placeholder="1012345678"
                    className="checkout-input"
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* PASO 2: PAGO SEGURO */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-step-bubble">2</div>
                <h2 className="checkout-card-title">Método de Pago</h2>
              </div>

              {/* SCRIPT OFICIAL BOLD PAYMENT BUTTON */}
              <Script 
                src="https://checkout.bold.co/library/boldPaymentButton.js" 
                strategy="afterInteractive" 
              />

              {/* BLOQUE PRINCIPAL: TUS PAGOS SON SEGUROS GRACIAS A BOLD */}
              <div className="bold-payment-box" style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', padding: '1.25rem', borderRadius: '14px', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldCheck size={22} color="var(--accent)" />
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Tus pagos son seguros gracias a
                    </span>
                    {/* LOGO OFICIAL BOLD */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.55rem', borderRadius: '6px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#111827', letterSpacing: '-0.5px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        bold<span style={{ color: '#ff2947' }}>.</span>
                      </span>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', background: 'rgba(0, 222, 133, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '20px' }}>
                    ✓ Vigilado Superfinanciera
                  </span>
                </div>

                <div className="bold-methods-grid">
                  <div className="bold-method-card">
                    <CreditCard size={18} color="#0284c7" />
                    <span className="bold-method-label">Tarjetas Crédito / Débito</span>
                  </div>
                  <div className="bold-method-card">
                    <Building2 size={18} color="#10b981" />
                    <span className="bold-method-label">PSE (Cualquier Banco)</span>
                  </div>
                  <div className="bold-method-card">
                    <Smartphone size={18} color="#d946ef" />
                    <span className="bold-method-label">Nequi & Daviplata</span>
                  </div>
                  <div className="bold-method-card">
                    <CheckCircle2 size={18} color="#f59e0b" />
                    <span className="bold-method-label">Botón Bancolombia</span>
                  </div>
                </div>
              </div>

              {/* ORDER BUMP ESTILO HOTMART (KIT DE BIENVENIDA) */}
              <div 
                className="checkout-order-bump"
                onClick={() => setIncludeKit(!includeKit)}
              >
                <input 
                  type="checkbox"
                  className="order-bump-checkbox"
                  checked={includeKit}
                  onChange={(e) => setIncludeKit(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="order-bump-content">
                  <span className="order-bump-tag">Oferta Especial de Bienvenida</span>
                  <div className="order-bump-title">
                    Kit de Iniciación y Material MPS (+{formatCOP(KIT_PRICE)})
                  </div>
                  <div className="order-bump-desc">
                    Incluye cuadernos de pauta musical oficial, convenios externos y beneficios con Yamaha, más stickers y carné institucional.
                  </div>
                </div>
                <div className="order-bump-price">
                  +{formatCOP(KIT_PRICE)}
                </div>
              </div>

              {/* BOTÓN CTA PRINCIPAL DE PAGO ONLINE SEGURO */}
              {paymentMethod === 'bold' && (
                <button 
                  type="submit" 
                  className="checkout-cta-btn"
                  disabled={submitting}
                >
                  <Lock size={20} />
                  {submitting 
                    ? 'Conectando con pasarela segura...' 
                    : `Pagar Inscripción ${formatCOP(totalPrice)} →`}
                </button>
              )}

              {/* DESPLEGABLE: OTRAS FORMAS DE PAGO */}
              <div style={{ marginTop: '1.4rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.2rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod(paymentMethod === 'nequi' ? 'bold' : 'nequi')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: paymentMethod === 'nequi' ? 'rgba(0, 222, 133, 0.08)' : 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Smartphone size={18} color="var(--accent)" />
                    <span>Otras formas de pago (Transferencia directa Nequi / Bre-B)</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {paymentMethod === 'nequi' ? '▲ Ocultar' : '▼ Desplegar'}
                  </span>
                </button>

                {paymentMethod === 'nequi' && (
                  <div style={{ marginTop: '1rem' }}>
                    <div className="nequi-payment-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                        <QrCode size={22} color="var(--accent)" />
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent)' }}>
                          Transferencia Manual a Cuenta Institucional
                        </span>
                      </div>

                      <div className="nequi-key-row">
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Llave Oficial Bre-B
                          </div>
                          <div className="nequi-key-value">@MIPRIMERSOL</div>
                        </div>
                        <button 
                          type="button" 
                          className={`copy-pill-btn ${copiedKey ? 'copied' : ''}`}
                          onClick={() => handleCopy('@MIPRIMERSOL', 'key')}
                        >
                          {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                          {copiedKey ? '¡Copiado!' : 'Copiar Llave'}
                        </button>
                      </div>

                      <div className="nequi-key-row">
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Línea Nequi Directa
                          </div>
                          <div className="nequi-key-value">302 355 77 60</div>
                        </div>
                        <button 
                          type="button" 
                          className={`copy-pill-btn ${copiedPhone ? 'copied' : ''}`}
                          onClick={() => handleCopy('3023557760', 'phone')}
                        >
                          {copiedPhone ? <Check size={14} /> : <Copy size={14} />}
                          {copiedPhone ? '¡Copiado!' : 'Copiar Celular'}
                        </button>
                      </div>

                      {/* ADJUNTAR COMPROBANTE OPCIONAL */}
                      <div style={{ marginTop: '1.2rem' }}>
                        <label className="checkout-label">Adjuntar comprobante de pago (Opcional)</label>
                        <div style={{
                          border: '1.5px dashed var(--glass-border)',
                          borderRadius: '10px',
                          padding: '1rem',
                          textAlign: 'center',
                          background: 'var(--bg-primary)',
                          cursor: 'pointer'
                        }}>
                          <input 
                            type="file" 
                            accept="image/*"
                            id="comprobante-input"
                            style={{ display: 'none' }}
                            onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
                          />
                          <label htmlFor="comprobante-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                            <FileCheck2 size={24} color="var(--accent)" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                              {comprobanteFile ? comprobanteFile.name : 'Haz clic para subir tu foto o captura del comprobante'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Formatos JPG, PNG o PDF
                            </span>
                          </label>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="checkout-cta-btn"
                        disabled={submitting}
                        style={{ marginTop: '1.2rem' }}
                      >
                        <Lock size={20} />
                        {submitting ? 'Registrando...' : `Confirmar Transferencia ${formatCOP(totalPrice)} →`}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SELLOS DE CONFIANZA INFERIORES */}
              <div className="checkout-trust-row">
                <div className="trust-item">
                  <ShieldCheck size={16} color="var(--accent)" />
                  <span>Pago 100% Protegido</span>
                </div>
                <div className="trust-item">
                  <CheckCircle2 size={16} color="var(--accent)" />
                  <span>Garantía de Formación MPS</span>
                </div>
                <div className="trust-item">
                  <Lock size={16} color="var(--accent)" />
                  <span>Privacidad Resguardada</span>
                </div>
              </div>

            </div>
          </form>
        </section>

        {/* COLUMNA DERECHA: RESUMEN DE LA ORDEN (STICKY SUMMARY) */}
        <aside className="checkout-summary-column">
          <div className="summary-card">
            <h3 className="summary-card-title">
              <Sparkles size={20} color="var(--accent)" />
              Resumen de tu Inscripción
            </h3>

            {/* PRODUCTO PRINCIPAL */}
            <div className="summary-product-box">
              <img 
                src={activeProgram.image} 
                alt={productTitle} 
                className="summary-product-img" 
              />
              <div className="summary-product-info">
                <span className="summary-product-tag">{activeProgram.category}</span>
                <div className="summary-product-name">{productTitle}</div>
                <div className="summary-product-badge">Modalidad Presencial • Escuela MPS</div>
              </div>
            </div>

            {/* SELECTOR DE PROGRAMA OFICIAL */}
            {customAmount === null && (
              <div style={{ marginBottom: '1rem' }}>
                <label className="checkout-label" style={{ fontSize: '0.8rem' }}>
                  Programa Académico Oficial:
                </label>
                <select 
                  className="summary-course-select"
                  value={selectedProgramKey}
                  onChange={(e) => setSelectedProgramKey(e.target.value)}
                >
                  <option value="mps-stage">⭐ MPS STAGE (Instrumento + Ensamble)</option>
                  <option value="curso-libre">🎵 Curso Libre de Instrumento (Link / One / Home)</option>
                  <option value="mps-producer">🎧 MPS PRODUCER (Producción de Audio)</option>
                  <option value="mps-prep">🎓 MPS PREP (Preuniversitario Musical)</option>
                  <option value="mps-music-camp">🎪 MPS MUSIC CAMP (Temporada Intensiva)</option>
                  <option value="matricula">📋 Matrícula Anual Institucional</option>
                </select>
              </div>
            )}

            {/* SELECTOR DE INSTRUMENTO (SI APLICA PARA STAGE O CURSO LIBRE) */}
            {hasInstrumentChoice && customAmount === null && (
              <div style={{ marginBottom: '1rem' }}>
                <label className="checkout-label" style={{ fontSize: '0.8rem' }}>
                  Instrumento o Área Principal:
                </label>
                <select 
                  className="summary-course-select"
                  value={selectedInstrument}
                  onChange={(e) => setSelectedInstrument(e.target.value)}
                >
                  {INSTRUMENTS_LIST.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SELECTOR MODALIDAD CLASES: LINK VS ONE */}
            {!isMatricula && customAmount === null && (
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="checkout-label" style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  Tipo de Formación:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setModality('grupal')}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '10px',
                      border: modality === 'grupal' ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                      background: modality === 'grupal' ? 'rgba(0, 222, 133, 0.12)' : 'var(--bg-primary)',
                      color: modality === 'grupal' ? 'var(--accent)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>👥 MPS Link (Grupal)</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>
                      {formatCOP(activeProgram.linkPrice)}/mes
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModality('individual')}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '10px',
                      border: modality === 'individual' ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                      background: modality === 'individual' ? 'rgba(0, 222, 133, 0.12)' : 'var(--bg-primary)',
                      color: modality === 'individual' ? 'var(--accent)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>👤 MPS One (1 a 1)</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>
                      {formatCOP(activeProgram.onePrice)}/mes
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* FICHA TÉCNICA E INFOGRAFÍA DEL PROGRAMA SELECCIONADO */}
            {!isMatricula && (
              <div className="program-detail-card">
                <div className="program-detail-header">
                  <span className="program-detail-top-badge">
                    <Sparkles size={13} /> {activeProgram.badge}
                  </span>
                  <h4 className="program-detail-title">{activeProgram.title}</h4>
                  <p className="program-detail-tagline">“{activeProgram.tagline}”</p>
                </div>

                <div className="program-duration-pill">
                  <span>⏱️ {activeProgram.duration}</span>
                </div>

                <div className="program-components-section-title">
                  Estructura y Componentes:
                </div>
                <div className="program-components-list">
                  {activeProgram.components.map((c, idx) => (
                    <div key={idx} className="program-component-item">
                      <div>
                        <div className="program-comp-name">{c.name}</div>
                        <span className="program-comp-format">{c.format}</span>
                      </div>
                      <span className="program-comp-hours">{c.hours}</span>
                    </div>
                  ))}
                </div>

                {/* SELECTOR DE HORARIO GRUPAL TRIMESTRAL (SI MODALIDAD ES GRUPAL / LINK) */}
                {modality === 'grupal' && activeSchedules.length > 0 && (
                  <div className="schedule-selector-box">
                    <div className="schedule-selector-title">
                      <span>📅 Horario Grupal Trimestral (Fijo)</span>
                    </div>
                    <p className="schedule-selector-desc">
                      Selecciona tu franja semanal de 2 horas (grupos reducidos de 2 a 4 alumnos):
                    </p>
                    <select 
                      className="schedule-options-select"
                      value={selectedSchedule}
                      onChange={(e) => setSelectedSchedule(e.target.value)}
                    >
                      {activeSchedules.map((sch) => (
                        <option key={sch.id} value={sch.label}>
                          {sch.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* BENEFICIOS INCLUIDOS */}
            <ul className="summary-benefits-list">
              <li className="summary-benefit-item">
                <CheckCircle2 size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Salas insonorizadas y equipadas con instrumentos profesionales</span>
              </li>
              <li className="summary-benefit-item">
                <CheckCircle2 size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Enfoque práctico con docentes profesionales activos en la industria</span>
              </li>
              <li className="summary-benefit-item">
                <CheckCircle2 size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Presentación y recital oficial al cierre de semestre</span>
              </li>
              {includeKit && (
                <li className="summary-benefit-item" style={{ color: '#ffa41b', fontWeight: 600 }}>
                  <CheckCircle2 size={16} color="#ffa41b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Kit de Iniciación y Material MPS incluido</span>
                </li>
              )}
            </ul>

            {/* CÓDIGO DE DESCUENTO */}
            <div style={{
              margin: '1rem 0',
              padding: '0.9rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)'
            }}>
              <label className="checkout-label" style={{ fontSize: '0.8rem', marginBottom: '0.4rem', display: 'block' }}>
                Código de descuento:
              </label>

              {appliedCoupon ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(0, 222, 133, 0.12)',
                  border: '1px solid var(--accent)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>
                    <CheckCircle2 size={16} />
                    <span>{appliedCoupon.codigo} (-{formatCOP(appliedCoupon.valor)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '0.2rem 0.4rem'
                    }}
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="checkout-input"
                    placeholder="Ej: MPS-DESCUENTO"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      if (couponError) setCouponError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.65rem 0.8rem',
                      letterSpacing: '1px',
                      textTransform: 'uppercase'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    style={{
                      padding: '0.65rem 1.1rem',
                      borderRadius: '8px',
                      background: 'var(--accent)',
                      color: '#062920',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: couponLoading || !couponCode.trim() ? 'not-allowed' : 'pointer',
                      opacity: couponLoading || !couponCode.trim() ? 0.6 : 1,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {couponLoading ? '...' : 'Aplicar'}
                  </button>
                </div>
              )}

              {couponError && (
                <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.4rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertCircle size={14} />
                  <span>{couponError}</span>
                </div>
              )}
            </div>

            {/* DESGLOSE FINANCIERO */}
            <div className="summary-price-breakdown">
              <div className="price-row">
                <span>Precio oficial:</span>
                <span style={{ textDecoration: discountAmount > 0 ? 'line-through' : 'none' }}>
                  {formatCOP(currentOriginal || basePrice)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="price-row discount">
                  <span>Descuento de bienvenida:</span>
                  <span>-{formatCOP(discountAmount)}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="price-row discount" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  <span>Descuento Cupón ({appliedCoupon.codigo}):</span>
                  <span>-{formatCOP(appliedCoupon.valor)}</span>
                </div>
              )}

              {includeKit && (
                <div className="price-row" style={{ color: '#ffa41b' }}>
                  <span>Kit de Iniciación MPS:</span>
                  <span>+{formatCOP(KIT_PRICE)}</span>
                </div>
              )}

              <div className="price-row total">
                <span>Total a Pagar:</span>
                <span className="price-total-number">{formatCOP(totalPrice)}</span>
              </div>
            </div>

            {/* BLOQUE DE GARANTÍA */}
            <div className="summary-guarantee-box">
              <ShieldCheck size={28} color="var(--accent)" style={{ flexShrink: 0 }} />
              <div className="guarantee-text">
                <strong>Garantía de Formación MPS</strong><br />
                Aprende con profesores activos en la industria y estudios profesionales equipados desde el primer día.
              </div>
            </div>

            {/* BOTÓN ASISTENCIA WHATSAPP */}
            <a 
              href={`https://wa.me/573008934407?text=${encodeURIComponent(`Hola MPS! Estoy en el checkout de ${productTitle} y tengo una consulta antes de realizar mi pago.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="summary-support-link"
            >
              <HelpCircle size={18} />
              <span>¿Dudas con el pago? Habla con un asesor</span>
            </a>

          </div>
        </aside>

      </main>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--accent)' }}>
        Cargando Checkout Seguro...
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
