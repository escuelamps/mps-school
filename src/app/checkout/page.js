"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  Search
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './checkout.css';

// CATÁLOGO OFICIAL DE PRODUCTOS Y CURSOS MPS
const COURSES_CATALOG = {
  canto: {
    id: 'canto',
    title: 'Técnica Vocal y Canto',
    category: 'Música • Voz',
    price: 230000,
    originalPrice: 250000,
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80',
    features: [
      'Clases prácticas con técnica diafragmática y afinación',
      'Acceso a cabinas insonorizadas y repertorio libre',
      'Participación en recital semestral en vivo'
    ]
  },
  piano: {
    id: 'piano',
    title: 'Piano y Teclados',
    category: 'Música • Teclados',
    price: 230000,
    originalPrice: 250000,
    image: 'https://images.unsplash.com/photo-1520523839898-507127050587?w=600&q=80',
    features: [
      'Lectura de partituras, digitación y armonía moderna',
      'Pianos acústicos y teclados sensibles al tacto',
      'Ensamble grupal y recital semestral'
    ]
  },
  guitarra: {
    id: 'guitarra',
    title: 'Guitarra (Acústica y Eléctrica)',
    category: 'Música • Cuerdas',
    price: 230000,
    originalPrice: 250000,
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80',
    features: [
      'Ritmos, acordes, escalas y técnica con plectro o dedos',
      'Amplificadores profesionales y pedales de efectos',
      'Recital semestral en vivo'
    ]
  },
  bateria: {
    id: 'bateria',
    title: 'Batería, Percusión y Marimba',
    category: 'Música • Percusión',
    price: 230000,
    originalPrice: 250000,
    image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&q=80',
    features: [
      'Independencia de extremidades, tempo y grooves',
      'Baterías acústicas profesionales insonorizadas',
      'Ensamble con otros instrumentos y recital'
    ]
  },
  bajo: {
    id: 'bajo',
    title: 'Bajo Eléctrico',
    category: 'Música • Cuerdas Graves',
    price: 230000,
    originalPrice: 250000,
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&q=80',
    features: [
      'Técnica de dedo, slap, muting y walking bass',
      'Conexión métrica con la percusión',
      'Recital semestral en vivo'
    ]
  },
  violin: {
    id: 'violin',
    title: 'Violín y Cuerdas Clásicas',
    category: 'Música • Cuerdas Frotadas',
    price: 230000,
    originalPrice: 250000,
    image: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600&q=80',
    features: [
      'Técnica del arco, postura ergonómica y afinación fina',
      'Lectura de partituras y repertorio clásico y moderno',
      'Recital semestral en vivo'
    ]
  },
  produccion: {
    id: 'produccion',
    title: 'Producción Musical y Mezcla',
    category: 'Tecnología Sonora',
    price: 280000,
    originalPrice: 300000,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80',
    features: [
      'Ableton Live, Logic Pro o FL Studio en estudios equipados',
      'Síntesis analógica, mezcla y masterización para streaming',
      'Entrega de proyecto musical terminado'
    ]
  },
  actuacion: {
    id: 'actuacion',
    title: 'Actuación y Expresión Escénica',
    category: 'Artes Escénicas',
    price: 240000,
    originalPrice: 260000,
    image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600&q=80',
    features: [
      'Expresión corporal, dicción y voz frente a cámara',
      'Construcción de personajes y monólogos',
      'Muestra escénica final'
    ]
  },
  matricula: {
    id: 'matricula',
    title: 'Matrícula Anual Institucional',
    category: 'Registro Oficial MPS',
    price: 120000,
    originalPrice: 150000,
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80',
    features: [
      'Habilitación de carné institucional y código de estudiante',
      'Acceso a reservas de salas de ensayo',
      'Descuentos en masterclasses y talleres exclusivos'
    ]
  },
  personalizado: {
    id: 'personalizado',
    title: 'Clases 1 a 1 Personalizadas (Mensual)',
    category: 'Formación VIP',
    price: 320000,
    originalPrice: 350000,
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    features: [
      'Atención 100% individual y horario preferencial',
      'Plan de estudio adaptado a tu velocidad y objetivos',
      'Grabación de audio de tus sesiones de avance'
    ]
  }
};

// BANCOS Y ENTIDADES FINANCIERAS PARA PSE EN COLOMBIA (COMPLETO)
const COLOMBIAN_BANKS = [
  'Bancolombia',
  'Nequi',
  'Banco Davivienda',
  'Daviplata',
  'Banco de Bogotá',
  'BBVA Colombia',
  'Banco Caja Social',
  'Banco Falabella',
  'Banco de Occidente',
  'Banco Agrario de Colombia',
  'Banco Itaú Colombia',
  'Banco Popular',
  'Banco AV Villas',
  'Banco Santander Colombia',
  'Banco Pichincha',
  'Banco GNB Sudameris',
  'Banco Serfinanza',
  'Bancoomeva',
  'Banco Coopcentral',
  'Bancamía',
  'Banco W',
  'Banco Unión',
  'Lulo Bank',
  'Nu Colombia (Nubank)',
  'RappiPay',
  'Dale! (Grupo Aval)',
  'Ualá Colombia',
  'Movii',
  'Iris (Financiera Dann Regional)',
  'Confiar Cooperativa Financiera',
  'Cotrafa Cooperativa Financiera',
  'Coofisam',
  'Financiera Juriscoop',
  'Coofinep Cooperativa Financiera'
];

function CheckoutContent() {
  const searchParams = useSearchParams();

  // Estados del formulario del comprador
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [telefono, setTelefono] = useState('');
  const [docId, setDocId] = useState('');

  // Selección de producto
  const [selectedCourseKey, setSelectedCourseKey] = useState('canto');
  const [customAmount, setCustomAmount] = useState(null);
  const [customTitle, setCustomTitle] = useState(null);

  // Order Bump (Kit de Bienvenida)
  const [includeKit, setIncludeKit] = useState(false);
  const KIT_PRICE = 35000;

  // Método de pago: 'mercadopago' | 'nequi'
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');

  // Subtipo Mercado Pago: 'tarjeta' | 'pse'
  const [mpSubtype, setMpSubtype] = useState('tarjeta');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [installments, setInstallments] = useState('1');
  const [pseBank, setPseBank] = useState('Bancolombia');
  const [bankSearch, setBankSearch] = useState('');

  const filteredBanks = COLOMBIAN_BANKS.filter(b => 
    b.toLowerCase().includes(bankSearch.toLowerCase())
  );

  // Nequi estados
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [comprobanteFile, setComprobanteFile] = useState(null);

  // Estados de proceso
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [successOrder, setSuccessOrder] = useState(null);

  // Leer query params al cargar
  useEffect(() => {
    const courseParam = searchParams.get('course') || searchParams.get('c');
    const programParam = searchParams.get('program');
    const typeParam = searchParams.get('type');
    const amountParam = searchParams.get('amount');
    const titleParam = searchParams.get('title');

    const key = courseParam || programParam || typeParam;
    if (key && COURSES_CATALOG[key.toLowerCase()]) {
      setSelectedCourseKey(key.toLowerCase());
    }

    if (amountParam && !isNaN(Number(amountParam))) {
      setCustomAmount(Number(amountParam));
    }
    if (titleParam) {
      setCustomTitle(decodeURIComponent(titleParam));
    }
  }, [searchParams]);

  const activeProduct = COURSES_CATALOG[selectedCourseKey] || COURSES_CATALOG.canto;
  const basePrice = customAmount !== null ? customAmount : activeProduct.price;
  const productTitle = customTitle || activeProduct.title;
  const discountAmount = customAmount !== null ? 0 : (activeProduct.originalPrice - activeProduct.price);
  const totalPrice = basePrice + (includeKit ? KIT_PRICE : 0);

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
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2500);
      }
    }
  };

  // Formateador de tarjeta con espacios cada 4 dígitos
  const handleCardNumberChange = (e) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = clean.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Formateador MM/AA
  const handleExpiryChange = (e) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  // Validación de formulario
  const validateForm = () => {
    const errors = {};
    if (!nombre.trim()) errors.nombre = 'Ingresa tu nombre y apellido completo';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Ingresa un correo electrónico válido';
    if (email !== emailConfirm) errors.emailConfirm = 'Los correos no coinciden';
    if (!telefono.trim() || telefono.length < 7) errors.telefono = 'Ingresa tu celular o WhatsApp';

    if (paymentMethod === 'mercadopago' && mpSubtype === 'tarjeta') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) errors.cardNumber = 'Ingresa los 16 dígitos de la tarjeta';
      if (!cardHolder.trim()) errors.cardHolder = 'Ingresa el nombre como figura en la tarjeta';
      if (cardExpiry.length < 5) errors.cardExpiry = 'Ingresa MM/AA';
      if (cardCvc.length < 3) errors.cardCvc = 'Ingresa CVC';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Envío del Checkout
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        cliente: {
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          telefono: telefono.trim(),
          docId: docId.trim() || 'N/A'
        },
        producto: {
          id: selectedCourseKey,
          titulo: productTitle,
          categoria: activeProduct.category,
          precioBase: basePrice,
          kitIncluido: includeKit,
          precioKit: includeKit ? KIT_PRICE : 0,
          totalCOP: totalPrice
        },
        metodoPago: paymentMethod, // 'mercadopago' | 'nequi'
        detallePago: paymentMethod === 'mercadopago' 
          ? {
              tipo: mpSubtype,
              cuotas: mpSubtype === 'tarjeta' ? installments : '1',
              bancoPSE: mpSubtype === 'pse' ? pseBank : 'N/A',
              ultimosDigitos: mpSubtype === 'tarjeta' ? cardNumber.slice(-4) : 'N/A'
            }
          : {
              llaveBreB: '@MIPRIMERSOL',
              telefonoNequi: '3008934407',
              comprobanteAdjunto: !!comprobanteFile
            },
        estado: paymentMethod === 'mercadopago' ? 'APROBADO_MERCADOPAGO' : 'PENDIENTE_VERIFICACION',
        fecha: new Date().toISOString(),
        origen: 'checkout_web_hotmart'
      };

      // Guardar registro en Firestore
      const docRef = await addDoc(collection(db, 'pagos_pendientes'), {
        ...orderData,
        createdAt: serverTimestamp()
      });

      // Si es Mercado Pago, intentar generar link oficial de pago / PSE
      if (paymentMethod === 'mercadopago') {
        try {
          const resPref = await fetch('/api/checkout/preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: productTitle,
              price: totalPrice,
              email: email.trim().toLowerCase(),
              studentName: nombre.trim(),
              orderId: docRef.id
            })
          });
          const prefData = await resPref.json();
          if (prefData.init_point) {
            window.location.href = prefData.init_point;
            return;
          }
        } catch (mpErr) {
          console.error('Error invocando preferencia MP:', mpErr);
        }
      }

      setSuccessOrder({
        id: docRef.id,
        ...orderData
      });

    } catch (err) {
      console.error('Error al procesar el pago:', err);
      // Fallback local en caso de error de red con Firestore
      setSuccessOrder({
        id: 'MPS-' + Math.floor(100000 + Math.random() * 900000),
        cliente: { nombre, email, telefono },
        producto: { titulo: productTitle, totalCOP: totalPrice },
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

      {/* MODAL DE ÉXITO ESTILO CONFIRMACIÓN HOTMART */}
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
              ¡Inscripción Confirmada!
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Método:</span>
                <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                  {successOrder.metodoPago === 'mercadopago' ? 'Mercado Pago (Online)' : 'Nequi / Bre-B'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Correo del alumno:</span>
                <span style={{ fontWeight: 700 }}>{successOrder.cliente.email}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <a 
                href={`https://wa.me/573008934407?text=${encodeURIComponent(`¡Hola MPS! Acabo de completar mi inscripción al curso ${successOrder.producto.titulo} (Ref: ${successOrder.id}). Mi nombre es ${successOrder.cliente.nombre}.`)}`}
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

            {/* PASO 2: FORMA DE PAGO */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-step-bubble">2</div>
                <h2 className="checkout-card-title">Selecciona la Forma de Pago</h2>
              </div>

              {/* SELECTOR DE PESTAÑAS: MERCADO PAGO VS NEQUI */}
              <div className="payment-tabs-container">
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'mercadopago' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('mercadopago')}
                >
                  <CreditCard size={24} color={paymentMethod === 'mercadopago' ? '#009ee3' : 'currentColor'} />
                  <span className="payment-tab-title">Mercado Pago</span>
                  <span className="payment-tab-subtitle">Tarjetas Débito / Crédito & PSE</span>
                </button>

                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'nequi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('nequi')}
                >
                  <Smartphone size={24} color={paymentMethod === 'nequi' ? 'var(--accent)' : 'currentColor'} />
                  <span className="payment-tab-title">Nequi / Bre-B</span>
                  <span className="payment-tab-subtitle">Transferencia Directa @MIPRIMERSOL</span>
                </button>
              </div>

              {/* DETALLE MERCADO PAGO */}
              {paymentMethod === 'mercadopago' && (
                <div className="mp-payment-box">
                  <div className="mp-brand-bar">
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Lock size={15} /> Pasarela Segura Mercado Pago
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Visa • Mastercard • Amex • PSE
                    </span>
                  </div>

                  {/* SUBOPCIONES: TARJETA VS PSE */}
                  <div className="mp-suboptions">
                    <button
                      type="button"
                      className={`mp-suboption-pill ${mpSubtype === 'tarjeta' ? 'active' : ''}`}
                      onClick={() => setMpSubtype('tarjeta')}
                    >
                      <CreditCard size={16} /> Tarjeta de Crédito / Débito
                    </button>
                    <button
                      type="button"
                      className={`mp-suboption-pill ${mpSubtype === 'pse' ? 'active' : ''}`}
                      onClick={() => setMpSubtype('pse')}
                    >
                      <Building2 size={16} /> PSE (Débito Bancario)
                    </button>
                  </div>

                  {/* FORMULARIO DE TARJETA */}
                  {mpSubtype === 'tarjeta' && (
                    <div>
                      <div className="checkout-input-group">
                        <label className="checkout-label">Número de tarjeta</label>
                        <input 
                          type="text"
                          placeholder="4500 0000 0000 0000"
                          className="checkout-input"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                        />
                        {formErrors.cardNumber && (
                          <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>
                            {formErrors.cardNumber}
                          </span>
                        )}
                      </div>

                      <div className="checkout-input-group">
                        <label className="checkout-label">Nombre impreso en la tarjeta</label>
                        <input 
                          type="text"
                          placeholder="Como aparece en el plástico"
                          className="checkout-input"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        />
                        {formErrors.cardHolder && (
                          <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>
                            {formErrors.cardHolder}
                          </span>
                        )}
                      </div>

                      <div className="checkout-grid-2">
                        <div className="checkout-input-group">
                          <label className="checkout-label">Vencimiento (MM/AA)</label>
                          <input 
                            type="text"
                            placeholder="MM/AA"
                            className="checkout-input"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                          />
                          {formErrors.cardExpiry && (
                            <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>
                              {formErrors.cardExpiry}
                            </span>
                          )}
                        </div>

                        <div className="checkout-input-group">
                          <label className="checkout-label">Código CVC / CVV</label>
                          <input 
                            type="password"
                            placeholder="123"
                            maxLength={4}
                            className="checkout-input"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                          />
                          {formErrors.cardCvc && (
                            <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>
                              {formErrors.cardCvc}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="checkout-input-group">
                        <label className="checkout-label">Cuotas</label>
                        <select 
                          className="checkout-input"
                          value={installments}
                          onChange={(e) => setInstallments(e.target.value)}
                        >
                          <option value="1">1 cuota de {formatCOP(totalPrice)} (Sin interés)</option>
                          <option value="3">3 cuotas de {formatCOP(totalPrice / 3)}</option>
                          <option value="6">6 cuotas de {formatCOP(totalPrice / 6)}</option>
                          <option value="12">12 cuotas de {formatCOP(totalPrice / 12)}</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* FORMULARIO PSE */}
                  {mpSubtype === 'pse' && (
                    <div>
                      <div className="checkout-input-group">
                        <label className="checkout-label">Selecciona tu Banco o Entidad Financiera (PSE)</label>
                        
                        {/* Buscador de banco en tiempo real */}
                        <div style={{ position: 'relative', marginBottom: '0.6rem' }}>
                          <input 
                            type="text"
                            placeholder="Buscar banco (ej. RappiPay, Bancolombia, Davivienda...)"
                            className="checkout-input"
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                          />
                          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                        </div>

                        <select 
                          className="checkout-input"
                          value={pseBank}
                          onChange={(e) => setPseBank(e.target.value)}
                        >
                          {filteredBanks.length > 0 ? (
                            filteredBanks.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))
                          ) : (
                            <option value="" disabled>No se encontró ningún banco con "{bankSearch}"</option>
                          )}
                        </select>
                        {filteredBanks.length === 0 && (
                          <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.3rem', display: 'block' }}>
                            No encontramos "{bankSearch}". Revisa la ortografía o limpia el buscador para ver todas las entidades.
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.5rem' }}>
                        Al pulsar <strong>Pagar con Mercado Pago</strong> serás redirigido de forma cifrada a la plataforma de PSE para autorizar la transacción en tu banco.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* DETALLE NEQUI / BRE-B */}
              {paymentMethod === 'nequi' && (
                <div className="nequi-payment-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                    <QrCode size={22} color="var(--accent)" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent)' }}>
                      Transferencia Directa Nequi / Bre-B
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
                      <div className="nequi-key-value">300 893 4407</div>
                    </div>
                    <button 
                      type="button" 
                      className={`copy-pill-btn ${copiedPhone ? 'copied' : ''}`}
                      onClick={() => handleCopy('3008934407', 'phone')}
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
                </div>
              )}

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
                    Incluye cuaderno de pauta musical oficial, afinador digital o baquetas según tu instrumento, más stickers y carné oficial.
                  </div>
                </div>
                <div className="order-bump-price">
                  +{formatCOP(KIT_PRICE)}
                </div>
              </div>

              {/* BOTÓN CTA PRINCIPAL */}
              <button 
                type="submit" 
                className="checkout-cta-btn"
                disabled={submitting}
              >
                <Lock size={20} />
                {submitting ? 'Procesando Pago Seguro...' : `Pagar Ahora ${formatCOP(totalPrice)}`}
              </button>

              {/* SELLOS DE CONFIANZA INFERIORES */}
              <div className="checkout-trust-row">
                <div className="trust-item">
                  <ShieldCheck size={16} color="var(--accent)" />
                  <span>Pago 100% Protegido</span>
                </div>
                <div className="trust-item">
                  <CheckCircle2 size={16} color="var(--accent)" />
                  <span>Garantía de Satisfacción</span>
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
                src={activeProduct.image} 
                alt={productTitle} 
                className="summary-product-img" 
              />
              <div className="summary-product-info">
                <span className="summary-product-tag">{activeProduct.category}</span>
                <div className="summary-product-name">{productTitle}</div>
                <div className="summary-product-badge">Modalidad Presencial • Escuela MPS</div>
              </div>
            </div>

            {/* SELECTOR PARA CAMBIAR DE CURSO */}
            {customAmount === null && (
              <div>
                <label className="checkout-label" style={{ fontSize: '0.8rem' }}>Cambiar de curso o programa:</label>
                <select 
                  className="summary-course-select"
                  value={selectedCourseKey}
                  onChange={(e) => setSelectedCourseKey(e.target.value)}
                >
                  {Object.entries(COURSES_CATALOG).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.title} — {formatCOP(item.price)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* BENEFICIOS INCLUIDOS */}
            <ul className="summary-benefits-list">
              {activeProduct.features.map((feat, i) => (
                <li key={i} className="summary-benefit-item">
                  <CheckCircle2 size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{feat}</span>
                </li>
              ))}
              {includeKit && (
                <li className="summary-benefit-item" style={{ color: '#ffa41b', fontWeight: 600 }}>
                  <CheckCircle2 size={16} color="#ffa41b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Kit de Iniciación y Material MPS incluido</span>
                </li>
              )}
            </ul>

            {/* DESGLOSE FINANCIERO */}
            <div className="summary-price-breakdown">
              <div className="price-row">
                <span>Precio oficial:</span>
                <span style={{ textDecoration: discountAmount > 0 ? 'line-through' : 'none' }}>
                  {formatCOP(activeProduct.originalPrice || basePrice)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="price-row discount">
                  <span>Descuento de bienvenida:</span>
                  <span>-{formatCOP(discountAmount)}</span>
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
