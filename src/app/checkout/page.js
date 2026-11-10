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
  Search
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

// CATÁLOGO OFICIAL DE PRODUCTOS Y CURSOS MPS
const COURSES_CATALOG = {
  canto: {
    id: 'canto',
    title: 'Técnica Vocal y Canto',
    category: 'Música • Voz',
    groupPrice: 230000,
    individualPrice: 320000,
    originalGroup: 250000,
    originalIndividual: 350000,
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80'
  },
  piano: {
    id: 'piano',
    title: 'Piano y Teclados',
    category: 'Música • Teclados',
    groupPrice: 230000,
    individualPrice: 320000,
    originalGroup: 250000,
    originalIndividual: 350000,
    image: 'https://images.unsplash.com/photo-1520523839898-507127050587?w=600&q=80'
  },
  guitarra: {
    id: 'guitarra',
    title: 'Guitarra (Acústica y Eléctrica)',
    category: 'Música • Cuerdas',
    groupPrice: 230000,
    individualPrice: 320000,
    originalGroup: 250000,
    originalIndividual: 350000,
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80'
  },
  bateria: {
    id: 'bateria',
    title: 'Batería, Percusión y Marimba',
    category: 'Música • Percusión',
    groupPrice: 230000,
    individualPrice: 320000,
    originalGroup: 250000,
    originalIndividual: 350000,
    image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&q=80'
  },
  bajo: {
    id: 'bajo',
    title: 'Bajo Eléctrico',
    category: 'Música • Cuerdas Graves',
    groupPrice: 230000,
    individualPrice: 320000,
    originalGroup: 250000,
    originalIndividual: 350000,
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&q=80'
  },
  violin: {
    id: 'violin',
    title: 'Violín y Cuerdas Clásicas',
    category: 'Música • Cuerdas Frotadas',
    groupPrice: 230000,
    individualPrice: 320000,
    originalGroup: 250000,
    originalIndividual: 350000,
    image: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600&q=80'
  },
  produccion: {
    id: 'produccion',
    title: 'Producción Musical y Mezcla',
    category: 'Tecnología Sonora',
    groupPrice: 280000,
    individualPrice: 360000,
    originalGroup: 300000,
    originalIndividual: 400000,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80'
  },
  actuacion: {
    id: 'actuacion',
    title: 'Actuación y Expresión Escénica',
    category: 'Artes Escénicas',
    groupPrice: 240000,
    individualPrice: 320000,
    originalGroup: 260000,
    originalIndividual: 350000,
    image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600&q=80'
  },
  matricula: {
    id: 'matricula',
    title: 'Matrícula Anual Institucional',
    category: 'Registro Oficial MPS',
    groupPrice: 120000,
    individualPrice: 120000,
    originalGroup: 150000,
    originalIndividual: 150000,
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80'
  },
  'music-camp': {
    id: 'music-camp',
    title: 'Music Camp (Vacacional Musical)',
    category: 'Programa Vacacional • 4 a 14 años',
    groupPrice: 250000,
    individualPrice: 350000,
    originalGroup: 280000,
    originalIndividual: 390000,
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80'
  },
  'mps-prep': {
    id: 'mps-prep',
    title: 'MPS Prep (Preparatorio Universitario)',
    category: 'Admisiones Universidad • Alto Rendimiento',
    groupPrice: 350000,
    individualPrice: 480000,
    originalGroup: 390000,
    originalIndividual: 520000,
    image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&q=80'
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
  const [modality, setModality] = useState('grupal'); // 'grupal' | 'individual'
  const [customAmount, setCustomAmount] = useState(null);
  const [customTitle, setCustomTitle] = useState(null);

  // Order Bump (Kit de Bienvenida)
  const [includeKit, setIncludeKit] = useState(false);
  const KIT_PRICE = 35000;

  // Método de pago: 'bold' | 'nequi'
  const [paymentMethod, setPaymentMethod] = useState('bold');

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

  // Cupón de descuento
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Leer query params al cargar
  useEffect(() => {
    const courseParam = searchParams.get('course') || searchParams.get('c');
    const programParam = searchParams.get('program');
    const typeParam = searchParams.get('type');
    const amountParam = searchParams.get('amount');
    const titleParam = searchParams.get('title');
    const modalityParam = searchParams.get('modality') || searchParams.get('m');

    const key = courseParam || programParam || typeParam;
    if (key && COURSES_CATALOG[key.toLowerCase()]) {
      setSelectedCourseKey(key.toLowerCase());
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

  const activeProduct = COURSES_CATALOG[selectedCourseKey] || COURSES_CATALOG.canto;
  const isMatricula = selectedCourseKey === 'matricula';
  const currentPrice = isMatricula ? activeProduct.groupPrice : (modality === 'individual' ? activeProduct.individualPrice : activeProduct.groupPrice);
  const currentOriginal = isMatricula ? activeProduct.originalGroup : (modality === 'individual' ? activeProduct.originalIndividual : activeProduct.originalGroup);
  const basePrice = customAmount !== null ? customAmount : currentPrice;
  const modalityText = isMatricula ? '' : (modality === 'individual' ? ' - MPS One (Individual)' : ' - MPS Link (Grupal)');
  const productTitle = (customTitle || activeProduct.title) + modalityText;
  const discountAmount = customAmount !== null ? 0 : (currentOriginal - currentPrice);
  const couponDiscount = appliedCoupon ? (Number(appliedCoupon.valor) || 0) : 0;
  const totalPrice = Math.max(0, basePrice + (includeKit ? KIT_PRICE : 0) - couponDiscount);

  // Validación y aplicación de cupón
  const handleApplyCoupon = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const q = query(
        collection(db, 'cupones_descuento'),
        where('codigo', '==', clean)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setCouponError('Código no válido o vencido');
        setAppliedCoupon(null);
        setCouponLoading(false);
        return;
      }

      const docSnap = snap.docs[0];
      const data = docSnap.data();

      // Validación interna de vigencia (30 días) y estado activo
      const now = new Date();
      let isExpired = false;
      if (data.expiresAt) {
        const expDate = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
        if (now > expDate) {
          isExpired = true;
        }
      }

      if (data.estado !== 'ACTIVO' || isExpired) {
        setCouponError('Código no válido o vencido');
        setAppliedCoupon(null);
        setCouponLoading(false);
        return;
      }

      setAppliedCoupon({
        id: docSnap.id,
        codigo: data.codigo,
        valor: Number(data.valor) || 0
      });
      setCouponError('');
    } catch (err) {
      console.error('Error validando cupón:', err);
      setCouponError('Código no válido o vencido');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const productFeatures = isMatricula 
    ? [
        'Habilitación de carné institucional y código estudiantil',
        'Acceso para reservar salas de ensayo insonorizadas',
        'Descuentos en masterclasses y talleres exclusivos'
      ]
    : (modality === 'individual'
        ? [
            'Clases 1 a 1 personalizadas con docente exclusivo',
            'Horario preferencial y avance a tu propio ritmo',
            'Salas insonorizadas equipadas y recital semestral en vivo'
          ]
        : [
            'Metodología práctica en grupos reducidos (máx 5 alumnos)',
            'Ensambles musicales y dinámicas colaborativas',
            'Salas insonorizadas equipadas y recital semestral en vivo'
          ]
      );

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

    if (paymentMethod === 'bold' && mpSubtype === 'tarjeta') {
      // Bold procesa los datos bancarios y de tarjeta en su pasarela cifrada oficial
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
          modalidad: isMatricula ? 'institucional' : modality,
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
        origen: 'checkout_web_hotmart'
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
                  {successOrder.metodoPago === 'bold' ? 'Bold (Online Seguro)' : successOrder.metodoPago === 'mercadopago' ? 'Mercado Pago (Online)' : 'Nequi / Bre-B'}
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

              {/* SCRIPT OFICIAL BOLD PAYMENT BUTTON */}
              <Script 
                src="https://checkout.bold.co/library/boldPaymentButton.js" 
                strategy="afterInteractive" 
              />

              {/* SELECTOR DE PESTAÑAS: BOLD VS NEQUI */}
              <div className="payment-tabs-container">
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'bold' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('bold')}
                >
                  <CreditCard size={24} color={paymentMethod === 'bold' ? '#ff2947' : 'currentColor'} />
                  <span className="payment-tab-title">Bold Pagos Online</span>
                  <span className="payment-tab-subtitle">Tarjetas, PSE, Nequi & Botón Bancolombia</span>
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

              {/* DETALLE BOLD PAGOS */}
              {paymentMethod === 'bold' && (
                <div className="bold-payment-box">
                  <div className="bold-brand-bar">
                    <span className="bold-brand-title">
                      <Lock size={16} /> Pasarela Oficial Bold
                    </span>
                    <span className="bold-brand-badge">
                      Cifrado Bancario SSL 256-bit
                    </span>
                  </div>

                  <p className="bold-desc-text">
                    Al hacer clic en <strong>Pagar con Bold</strong>, se abrirá la pasarela oficial para pagar de forma 100% segura mediante:
                  </p>

                  <div className="bold-methods-grid">
                    <div className="bold-method-card">
                      <CreditCard size={18} color="#0284c7" />
                      <span className="bold-method-label">Tarjetas Crédito / Débito</span>
                    </div>
                    <div className="bold-method-card">
                      <Building2 size={18} color="#10b981" />
                      <span className="bold-method-label">PSE Débito</span>
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
                    Incluye cuadernos de pauta musical oficial, convenios externos y beneficios con Yamaha, más stickers y carné institucional.
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
                style={paymentMethod === 'bold' ? { background: 'linear-gradient(270deg, #ff2947 13.86%, #121e6c 83.33%)' } : {}}
              >
                <Lock size={20} />
                {submitting 
                  ? 'Abriendo Pasarela de Pago...' 
                  : paymentMethod === 'bold' 
                    ? `Pagar con Bold ${formatCOP(totalPrice)} →` 
                    : `Confirmar Pedido ${formatCOP(totalPrice)}`}
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
                <label className="checkout-label" style={{ fontSize: '0.8rem' }}>Curso o programa:</label>
                <select 
                  className="summary-course-select"
                  value={selectedCourseKey}
                  onChange={(e) => setSelectedCourseKey(e.target.value)}
                >
                  {Object.entries(COURSES_CATALOG).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SELECTOR CLASES GRUPALES VS INDIVIDUALES */}
            {!isMatricula && customAmount === null && (
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="checkout-label" style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  Tipo de Clase:
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
                      {formatCOP(activeProduct.groupPrice)}/mes
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
                      {formatCOP(activeProduct.individualPrice)}/mes
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* BENEFICIOS INCLUIDOS */}
            <ul className="summary-benefits-list">
              {productFeatures.map((feat, i) => (
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
