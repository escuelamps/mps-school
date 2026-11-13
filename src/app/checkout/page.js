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
  doc,
  onSnapshot
} from 'firebase/firestore';
import './checkout.css';

import { 
  OFFICIAL_PROGRAMS, 
  INSTRUMENTS_LIST, 
  GROUP_SCHEDULES, 
  KIT_PRICE, 
  OFFICIAL_TARIFAS_DEFAULT,
  formatCOP 
} from '@/data/programs';

// BANCOS PARA PSE EN COLOMBIA
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
  'Nu Colombia (Nubank)',
  'Lulo Bank',
  'RappiPay',
  'Dale! (Grupo Aval)',
  'Ualá Colombia',
  'Movii'
];

function CheckoutContent() {
  const searchParams = useSearchParams();

  // Estados del comprador
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [telefono, setTelefono] = useState('');
  const [docId, setDocId] = useState('');

  // Selección de programa e instrumento
  const [selectedProgramKey, setSelectedProgramKey] = useState('mps-stage');
  const [selectedInstrument, setSelectedInstrument] = useState('canto');
  const [modality, setModality] = useState('grupal'); // 'grupal' (MPS Link) | 'individual' (MPS One)
  const [classPackage, setClassPackage] = useState(4); // 4, 8, 12 clases
  const [locationType, setLocationType] = useState('sede'); // 'sede' | 'domicilio'
  const [liveTarifas, setLiveTarifas] = useState(OFFICIAL_TARIFAS_DEFAULT);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [customAmount, setCustomAmount] = useState(null);
  const [customTitle, setCustomTitle] = useState(null);

  // Escuchar tarifas oficiales dinámicas de Firestore
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'tarifas'), (snapshot) => {
        if (!snapshot.empty) {
          const loaded = {};
          snapshot.forEach(docSnap => {
            loaded[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
          });
          setLiveTarifas(prev => ({ ...prev, ...loaded }));
        }
      }, (err) => {
        console.warn('Usando catálogo local de tarifas oficiales:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Error inicializando listener de tarifas:', e);
    }
  }, []);

  // Order Bump (Kit de Bienvenida) & Matrícula Anual
  const [includeKit, setIncludeKit] = useState(false);
  const [includeMatricula, setIncludeMatricula] = useState(true);

  // Método de pago: 'tarjeta' | 'pse' | 'nequi'
  const [paymentSubtype, setPaymentSubtype] = useState('tarjeta'); // 'tarjeta' | 'pse'
  const [showOtherMethods, setShowOtherMethods] = useState(false); // Desplegable Nequi / Bre-B

  // Campos de Tarjeta de Crédito / Débito
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [installments, setInstallments] = useState('1');

  // Campos de PSE
  const [pseBank, setPseBank] = useState('Bancolombia');

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

  // Formateadores de Tarjeta
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(val);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardExpiry(val);
  };

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
    } else if (key === 'actuacion' || key === 'taller-actuacion') {
      setSelectedProgramKey('taller-actuacion');
    } else if (key === 'matricula') {
      setSelectedProgramKey('curso-libre');
      setIncludeMatricula(true);
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
  const hasInstrumentChoice = selectedProgramKey === 'curso-libre' || selectedProgramKey === 'mps-stage';

  // Cálculo dinámico de tarifa oficial en tiempo real
  let dynamicCalculatedPrice = 0;
  let dynamicModalityLabel = '';

  if (selectedProgramKey === 'taller-actuacion') {
    dynamicCalculatedPrice = liveTarifas['taller_actuacion_trimestre']?.precio || activeProgram.linkPrice || 600000;
    dynamicModalityLabel = ' - Trimestre Completo (3 Meses)';
  } else if (modality === 'grupal') {
    dynamicCalculatedPrice = liveTarifas['grupal_semipersonalizado_mes']?.precio || activeProgram.linkPrice || 180000;
    dynamicModalityLabel = ' - MPS Link (Grupal Semipersonalizado)';
  } else {
    // Individual (MPS One)
    const tarifaKey = `individual_${locationType}_${classPackage}`;
    const matched = liveTarifas[tarifaKey];
    dynamicCalculatedPrice = matched?.precio || (locationType === 'domicilio' ? (classPackage === 4 ? 305000 : classPackage === 8 ? 590000 : 830000) : (classPackage === 4 ? 280000 : classPackage === 8 ? 520000 : 720000));
    const locName = locationType === 'domicilio' ? 'A Domicilio' : 'En Sede';
    dynamicModalityLabel = ` - MPS One ${locName} (${classPackage} Clases)`;
  }

  const basePrice = customAmount !== null ? customAmount : dynamicCalculatedPrice;
  const matriculaPrice = liveTarifas['matricula_institucional']?.precio || 50000;
  const matriculaFee = includeMatricula ? matriculaPrice : 0;
  const instrumentLabel = hasInstrumentChoice ? ` (${INSTRUMENTS_LIST.find(i => i.id === selectedInstrument)?.name || selectedInstrument})` : '';
  const modalityLabel = dynamicModalityLabel;
  const matriculaTag = includeMatricula ? ' + Matrícula' : '';
  const productTitle = (customTitle || activeProgram.title) + instrumentLabel + modalityLabel + matriculaTag;

  const couponDiscount = appliedCoupon ? (Number(appliedCoupon.valor) || 0) : 0;
  const totalPrice = Math.max(0, basePrice + (includeKit ? KIT_PRICE : 0) + matriculaFee - couponDiscount);

  // Horarios disponibles para el programa/instrumento activo
  const activeSchedulesKey = hasInstrumentChoice ? selectedInstrument : selectedProgramKey;
  const activeSchedules = GROUP_SCHEDULES[activeSchedulesKey] || GROUP_SCHEDULES[selectedProgramKey] || [];

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
  const handleSubmit = async (e, forceMethod = null) => {
    if (e) e.preventDefault();

    const activeMethod = forceMethod || (showOtherMethods ? 'nequi' : paymentSubtype);

    const errors = {};
    if (!nombre.trim()) errors.nombre = 'Ingresa tu nombre completo';
    if (!email.trim() || !email.includes('@')) errors.email = 'Ingresa un correo válido';
    if (email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
      errors.emailConfirm = 'Los correos no coinciden';
    }
    if (!telefono.trim() || telefono.length < 7) errors.telefono = 'Ingresa un número de celular de contacto válido';

    // Validación de datos personales obligatorios
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
          modalidad: selectedProgramKey === 'taller-actuacion' ? 'Taller Especial (3 Meses)' : (modality === 'grupal' ? 'MPS Link (Grupal)' : `MPS One (${locationType === 'domicilio' ? 'A Domicilio' : 'En Sede'})`),
          horarioSeleccionado: modality === 'grupal' ? (selectedSchedule || 'Grupal Trimestral - Por coordinar') : 'Personalizado con docente',
          precioBase: basePrice,
          matriculaIncluida: includeMatricula,
          precioMatricula: matriculaFee,
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
        metodoPago: activeMethod, // 'tarjeta' | 'pse' | 'nequi'
        detallePago: activeMethod === 'tarjeta'
          ? {
              pasarela: 'Bold Pagos Oficial',
              tipo: 'Tarjeta Crédito/Débito',
              titular: cardHolder,
              ultimosDigitos: cardNumber.replace(/\s/g, '').slice(-4),
              cuotas: installments,
              moneda: 'COP',
              monto: totalPrice
            }
          : activeMethod === 'pse'
            ? {
                pasarela: 'Bold PSE Oficial',
                tipo: 'PSE Débito Bancario',
                banco: pseBank,
                moneda: 'COP',
                monto: totalPrice
              }
            : {
                llaveBreB: '@MIPRIMERSOL',
                telefonoNequi: '3023557760',
                comprobanteAdjunto: !!comprobanteFile
              },
        estado: activeMethod === 'nequi' ? 'PENDIENTE_VERIFICACION' : 'PENDIENTE_PAGO_BOLD',
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

      // Si es Bold (tarjeta o PSE), abrir pasarela segura de confirmación
      if (activeMethod !== 'nequi') {
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
        metodoPago: activeMethod
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
                  {successOrder.metodoPago === 'tarjeta' ? 'Tarjeta Crédito / Débito' : successOrder.metodoPago === 'pse' ? 'PSE Débito' : 'Transferencia Nequi / Bre-B'}
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
                  placeholder="Ej: Nombre completo del estudiante o acudiente"
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

            {/* PASO 2: MÉTODO DE PAGO */}
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

              {/* SUBOPCIONES: TARJETA VS PSE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.2rem' }}>
                <button
                  type="button"
                  onClick={() => { setPaymentSubtype('tarjeta'); setShowOtherMethods(false); }}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: paymentSubtype === 'tarjeta' && !showOtherMethods ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                    background: paymentSubtype === 'tarjeta' && !showOtherMethods ? 'rgba(0, 222, 133, 0.12)' : 'var(--bg-primary)',
                    color: paymentSubtype === 'tarjeta' && !showOtherMethods ? 'var(--accent)' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CreditCard size={18} />
                  <span>Tarjeta de Crédito / Débito</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentSubtype('pse'); setShowOtherMethods(false); }}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: paymentSubtype === 'pse' && !showOtherMethods ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                    background: paymentSubtype === 'pse' && !showOtherMethods ? 'rgba(0, 222, 133, 0.12)' : 'var(--bg-primary)',
                    color: paymentSubtype === 'pse' && !showOtherMethods ? 'var(--accent)' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Building2 size={18} />
                  <span>PSE (Débito Bancario)</span>
                </button>
              </div>

              {/* INFORMACIÓN PAGO CON TARJETA VÍA BOLD */}
              {paymentSubtype === 'tarjeta' && !showOtherMethods && (
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Lock size={16} color="var(--accent)" /> Pago Seguro con Tarjeta Crédito o Débito
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Visa • Mastercard • Amex
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Al pulsar en <strong>Pagar Inscripción</strong>, se abrirá la pasarela oficial protegida de <strong>Bold</strong> para ingresar tu tarjeta de forma 100% segura con cifrado bancario de extremo a extremo y diferir tus cuotas.
                  </p>
                </div>
              )}

              {/* INFORMACIÓN PAGO PSE VÍA BOLD */}
              {paymentSubtype === 'pse' && !showOtherMethods && (
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={16} color="var(--accent)" /> Pago Seguro por PSE (Cuentas de Ahorros / Corriente)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Cualquier banco en Colombia
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Al pulsar en <strong>Pagar Inscripción</strong>, seleccionarás tu entidad bancaria dentro de la pasarela oficial de <strong>Bold</strong> para autorizar el débito en línea de forma inmediata.
                  </p>
                </div>
              )}

              {/* SELLO DE SEGURIDAD BOLD */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem', padding: '0.6rem 0.8rem', background: 'rgba(0, 222, 133, 0.05)', borderRadius: '8px', border: '1px solid rgba(0, 222, 133, 0.2)', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <ShieldCheck size={16} color="var(--accent)" />
                  <span>Tus pagos son procesados de forma segura con</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.1rem 0.45rem', borderRadius: '4px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#111827', letterSpacing: '-0.5px' }}>
                      bold<span style={{ color: '#ff2947' }}>.</span>
                    </span>
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)' }}>
                  ✓ Vigilado Superfinanciera
                </span>
              </div>

              {/* SELECTOR MATRÍCULA INSTITUCIONAL ANUAL */}
              <div 
                className="checkout-order-bump"
                style={{
                  borderColor: includeMatricula ? '#38bdf8' : 'var(--glass-border)',
                  background: includeMatricula ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-secondary)',
                  marginBottom: '1rem'
                }}
                onClick={() => setIncludeMatricula(!includeMatricula)}
              >
                <input 
                  type="checkbox"
                  className="order-bump-checkbox"
                  style={{ accentColor: '#38bdf8' }}
                  checked={includeMatricula}
                  onChange={(e) => setIncludeMatricula(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="order-bump-content">
                  <span className="order-bump-tag" style={{ background: '#38bdf8', color: '#000f11' }}>
                    Registro Estudiantil Oficial
                  </span>
                  <div className="order-bump-title" style={{ color: includeMatricula ? '#38bdf8' : 'var(--text-primary)' }}>
                    Matrícula Anual Institucional (+{formatCOP(matriculaPrice)})
                  </div>
                  <div className="order-bump-desc">
                    Habilita tu condición de estudiante activo en Escuela MPS, carné estudiantil oficial, reservas ilimitadas de salas de ensayo y convenios Yamaha.
                  </div>
                </div>
                <div className="order-bump-price" style={{ color: '#38bdf8' }}>
                  +{formatCOP(matriculaPrice)}
                </div>
              </div>

              {/* ORDER BUMP (KIT DE BIENVENIDA) */}
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
              {!showOtherMethods && (
                <button 
                  type="submit" 
                  className="checkout-cta-btn"
                  disabled={submitting}
                >
                  <Lock size={20} />
                  {submitting 
                    ? 'Procesando pago seguro...' 
                    : `Pagar Inscripción ${formatCOP(totalPrice)} →`}
                </button>
              )}

              {/* DESPLEGABLE: OTRAS FORMAS DE PAGO (NEQUI / BRE-B CON QR) */}
              <div style={{ marginTop: '1.4rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.2rem' }}>
                <button
                  type="button"
                  onClick={() => setShowOtherMethods(!showOtherMethods)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: showOtherMethods ? 'rgba(0, 222, 133, 0.08)' : 'var(--bg-primary)',
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
                    <span>Otras formas de pago (Transferencia directa Nequi / Bre-B con QR)</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {showOtherMethods ? '▲ Ocultar' : '▼ Desplegar'}
                  </span>
                </button>

                {showOtherMethods && (
                  <div style={{ marginTop: '1rem' }}>
                    <div className="nequi-payment-box">
                      
                      {/* CÓDIGO QR OFICIAL DE /CENA */}
                      <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                        <div style={{
                          width: '180px',
                          height: '180px',
                          background: '#ffffff',
                          padding: '10px',
                          borderRadius: '14px',
                          margin: '0 auto 0.8rem auto',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.5px solid var(--accent)'
                        }}>
                          <img 
                            src="/images/qr.png" 
                            alt="Código QR Nequi y Bre-B MPS" 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                          />
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                          Escanea desde tu app de <strong>Nequi</strong> o <strong>Bancolombia</strong> para transferir
                        </p>
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
                        type="button" 
                        onClick={(e) => handleSubmit(e, 'nequi')}
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
                  <option value="curso-libre">🎵 Curso Libre de Instrumento (MPS Link / MPS One)</option>
                  <option value="taller-actuacion">🎭 Taller de Actuación MPS (Trimestre)</option>
                  <option value="mps-producer">🎧 MPS PRODUCER (Producción de Audio)</option>
                  <option value="mps-pre-universitario">🎓 Preuniversitario Musical</option>
                  <option value="mps-music-camp">🎪 MPS MUSIC CAMP (Temporada Intensiva)</option>
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

            {/* SELECTOR MODALIDAD CLASES: MPS LINK VS MPS ONE */}
            {selectedProgramKey !== 'taller-actuacion' && customAmount === null && (
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="checkout-label" style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  Modalidad de Formación:
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
                      {formatCOP(liveTarifas['grupal_semipersonalizado_mes']?.precio || 180000)}/mes
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
                    <span>👤 MPS One (Individual)</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>
                      Desde {formatCOP(liveTarifas['individual_sede_4']?.precio || 280000)}
                    </span>
                  </button>
                </div>

                {/* SUB-SELECTOR CLASES INDIVIDUALES: UBICACIÓN Y PAQUETE */}
                {modality === 'individual' && (
                  <div style={{ marginTop: '0.9rem', padding: '0.9rem', background: 'rgba(0, 222, 133, 0.04)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                    
                    {/* Ubicación: Sede o Domicilio con Indicador Claro de Tarifa */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                          Ubicación:
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: locationType === 'domicilio' ? '#38bdf8' : 'var(--accent)', background: locationType === 'domicilio' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(0, 222, 133, 0.12)', padding: '0.2rem 0.6rem', borderRadius: '4px', letterSpacing: '0.3px' }}>
                          {locationType === 'domicilio' ? '🚗 Tarifa MPS One Domicilio Activa' : '📍 Tarifa MPS One en Sede Activa'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setLocationType('sede')}
                          style={{
                            padding: '0.5rem 0.3rem',
                            borderRadius: '8px',
                            border: locationType === 'sede' ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                            background: locationType === 'sede' ? 'rgba(0, 222, 133, 0.15)' : 'var(--bg-primary)',
                            color: locationType === 'sede' ? 'var(--accent)' : 'var(--text-primary)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          🏢 En Sede MPS
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocationType('domicilio')}
                          style={{
                            padding: '0.5rem 0.3rem',
                            borderRadius: '8px',
                            border: locationType === 'domicilio' ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                            background: locationType === 'domicilio' ? 'rgba(0, 222, 133, 0.15)' : 'var(--bg-primary)',
                            color: locationType === 'domicilio' ? 'var(--accent)' : 'var(--text-primary)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          🏠 A Domicilio
                        </button>
                      </div>
                    </div>

                    {/* Paquete de Clases: 4, 8 o 12 */}
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Paquete de Clases:
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                        {[4, 8, 12].map((num) => {
                          const pKey = `individual_${locationType}_${num}`;
                          const pTarifa = liveTarifas[pKey];
                          const priceVal = pTarifa?.precio || (locationType === 'domicilio' ? (num === 4 ? 305000 : num === 8 ? 590000 : 830000) : (num === 4 ? 280000 : num === 8 ? 520000 : 720000));
                          const isSel = classPackage === num;

                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setClassPackage(num)}
                              style={{
                                padding: '0.6rem 0.2rem',
                                borderRadius: '8px',
                                border: isSel ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                                background: isSel ? 'rgba(0, 222, 133, 0.15)' : 'var(--bg-primary)',
                                color: isSel ? 'var(--accent)' : 'var(--text-primary)',
                                cursor: 'pointer',
                                textAlign: 'center'
                              }}
                            >
                              <div style={{ fontWeight: 800, fontSize: '0.82rem' }}>{num} Clases</div>
                              <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '2px', fontWeight: 600 }}>{formatCOP(priceVal)}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CUADRO COMPLETO CON TODA LA INFORMACIÓN DEL PROGRAMA */}
            {activeProgram && (
              <div className="program-detail-card" style={{ background: 'var(--bg-primary)', border: '1.5px solid var(--accent)', borderRadius: '14px', padding: '1.3rem', margin: '1.2rem 0', boxShadow: '0 8px 25px rgba(0, 222, 133, 0.08)' }}>
                
                {/* ENCABEZADO Y BADGE */}
                <div className="program-detail-header" style={{ marginBottom: '0.8rem' }}>
                  <span className="program-detail-top-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 222, 133, 0.15)', color: 'var(--accent)', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Sparkles size={13} /> {activeProgram.badge}
                  </span>
                  <h4 className="program-detail-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0 0.2rem 0' }}>
                    {activeProgram.title}
                  </h4>
                  <p className="program-detail-tagline" style={{ fontSize: '0.86rem', color: 'var(--accent)', fontStyle: 'italic', margin: 0, fontWeight: 600 }}>
                    “{activeProgram.tagline}”
                  </p>
                </div>

                {/* ¿EN QUÉ CONSISTE? (DESCRIPCIÓN DE LA INFOGRAFÍA) */}
                <div style={{ background: 'rgba(0, 0, 0, 0.03)', padding: '0.85rem', borderRadius: '10px', margin: '0.8rem 0', borderLeft: '3px solid var(--accent)' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
                    📖 ¿En qué consiste este programa?
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                    {activeProgram.description}
                  </p>
                </div>

                {/* DURACIÓN E INTENSIDAD */}
                <div className="program-duration-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 222, 133, 0.08)', border: '1px solid rgba(0, 222, 133, 0.25)', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.8rem 0' }}>
                  <span>⏱️ {activeProgram.duration}</span>
                </div>

                {/* ESTRUCTURA Y COMPONENTES */}
                <div className="program-components-section-title" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '1rem 0 0.5rem 0' }}>
                  🎯 Estructura y Componentes de Formación:
                </div>
                <div className="program-components-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeProgram.components.map((c, idx) => (
                    <div key={idx} className="program-component-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid var(--glass-border)', padding: '0.6rem 0.75rem', borderRadius: '8px' }}>
                      <div style={{ paddingRight: '0.5rem' }}>
                        <div className="program-comp-name" style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{c.name}</div>
                        <span className="program-comp-format" style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.15rem', lineHeight: 1.35 }}>{c.format}</span>
                      </div>
                      <span className="program-comp-hours" style={{ fontWeight: 800, color: 'var(--accent)', background: 'rgba(0, 222, 133, 0.12)', padding: '0.25rem 0.55rem', borderRadius: '6px', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                        {c.hours}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ¿QUÉ DESARROLLA EL ESTUDIANTE? */}
                {activeProgram.develops && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.5rem' }}>
                      🚀 ¿Qué desarrolla el estudiante?
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {activeProgram.develops.map((dev, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          <CheckCircle2 size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: '3px' }} />
                          <span>{dev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CIERRE / PRESENTACIÓN EN VIVO */}
                <div style={{ marginTop: '0.9rem', padding: '0.65rem 0.8rem', background: 'rgba(0, 0, 0, 0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <Sparkles size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <span><strong>Cierre del Proceso:</strong> {activeProgram.presentation}</span>
                </div>

                {/* SELECTOR DE HORARIO GRUPAL TRIMESTRAL (SI MODALIDAD ES GRUPAL / LINK) */}
                {modality === 'grupal' && activeSchedules.length > 0 && (
                  <div className="schedule-selector-box" style={{ marginTop: '1rem', background: 'rgba(0, 222, 133, 0.06)', border: '1.5px solid var(--accent)', borderRadius: '10px', padding: '0.9rem' }}>
                    <div className="schedule-selector-title" style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <Calendar size={16} color="var(--accent)" />
                      <span>Horario Grupal Trimestral (Fijo de la Libreta)</span>
                    </div>
                    <p className="schedule-selector-desc" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '0 0 0.6rem 0', lineHeight: 1.4 }}>
                      Selecciona tu franja semanal de 2 horas (grupos reducidos de 2 a 4 alumnos):
                    </p>
                    <select 
                      className="schedule-options-select"
                      value={selectedSchedule}
                      onChange={(e) => setSelectedSchedule(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-primary)', border: '1.5px solid var(--accent)', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', outline: 'none' }}
                    >
                      {activeSchedules.map((sch) => (
                        <option key={sch.id} value={sch.label}>
                          {sch.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* CUADRO DESTACADO: KIT DE BIENVENIDA SELECCIONADO */}
                {includeKit && (
                  <div style={{
                    marginTop: '1.1rem',
                    padding: '0.9rem',
                    background: 'rgba(255, 164, 27, 0.1)',
                    border: '1.5px solid #ffa41b',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    boxShadow: '0 4px 12px rgba(255, 164, 27, 0.12)'
                  }}>
                    <Sparkles size={20} color="#ffa41b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#ffa41b', marginBottom: '0.2rem' }}>
                        🎁 Kit de Iniciación y Material MPS Incluido (+ {formatCOP(KIT_PRICE)})
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        Incluye cuadernos de pauta musical oficial, convenios externos y beneficios con Yamaha, stickers institucionales y carné estudiantil.
                      </div>
                    </div>
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
                <span>{formatCOP(basePrice)}</span>
              </div>

              {appliedCoupon && (
                <div className="price-row discount" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  <span>Descuento Cupón ({appliedCoupon.codigo}):</span>
                  <span>-{formatCOP(appliedCoupon.valor)}</span>
                </div>
              )}

              {includeMatricula && (
                <div className="price-row" style={{ color: '#38bdf8' }}>
                  <span>Matrícula Anual Institucional:</span>
                  <span>+{formatCOP(matriculaPrice)}</span>
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
