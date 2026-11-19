'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LogOut, 
  Book, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight, 
  User, 
  CreditCard, 
  ExternalLink, 
  Sparkles, 
  MapPin, 
  Phone,
  RefreshCw,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { ModalOverlay } from '@/components/Modals';

const getInstrumentIcon = (instrumentName) => {
  if (!instrumentName) return '🎵';
  const name = instrumentName.toLowerCase();
  if (name.includes('piano') || name.includes('teclado')) return '🎹';
  if (name.includes('guitarra') || name.includes('bajo') || name.includes('cuerda') || name.includes('ukelele')) return '🎸';
  if (name.includes('violín') || name.includes('violin') || name.includes('chelo')) return '🎻';
  if (name.includes('batería') || name.includes('bateria') || name.includes('percusi')) return '🥁';
  if (name.includes('vocal') || name.includes('canto') || name.includes('voz') || name.includes('técnica')) return '🎤';
  if (name.includes('actuación') || name.includes('actuacion') || name.includes('teatro')) return '🎭';
  if (name.includes('saxo') || name.includes('viento')) return '🎷';
  if (name.includes('producción') || name.includes('produccion') || name.includes('audio')) return '🎧';
  return '🎵';
};

export default function StudentPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Perfil del estudiante en Firestore
  const [studentDoc, setStudentDoc] = useState(null);
  const [packageCredits, setPackageCredits] = useState(4);
  const [programTitle, setProgramTitle] = useState('MPS One (Clases Individuales)');

  // Slots de Agenda
  const [allSlots, setAllSlots] = useState([]);
  const [myBookedSlots, setMyBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Modales
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedSlotToBook, setSelectedSlotToBook] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');

  // Cancelación
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [slotToCancel, setSlotToCancel] = useState(null);
  const [cancelRefundable, setCancelRefundable] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Classroom
  const [classroomCourses, setClassroomCourses] = useState([]);
  const [loadingClassroom, setLoadingClassroom] = useState(true);

  // 1. Cargar Sesión
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.username || (data.role !== 'student' && data.role !== 'user')) {
          router.push('/login');
        } else {
          setSession(data);
          setLoading(false);
        }
      })
      .catch(() => router.push('/login'));

    fetch('/api/classroom')
      .then(res => res.json())
      .then(data => {
        setClassroomCourses(data.courses || []);
        setLoadingClassroom(false);
      })
      .catch(() => setLoadingClassroom(false));
  }, [router]);

  // 2. Cargar perfil y créditos del estudiante en Firestore
  useEffect(() => {
    if (!session?.email) return;

    let unsubUser = () => {};
    const loadStudentProfile = async () => {
      try {
        const userEmail = session.email.toLowerCase().trim();
        const userRef = doc(db, 'users', userEmail);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const uData = userSnap.data();
          setStudentDoc(uData);
          setPackageCredits(uData.packageCredits ?? (uData.clasesDisponibles ?? 4));
          setProgramTitle(uData.program || uData.programa || 'MPS One (Clases Individuales)');
        } else {
          // Si no existe el documento exacto con el email, buscar por campo email
          const q = query(collection(db, 'users'), where('email', '==', userEmail));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const uData = querySnap.docs[0].data();
            setStudentDoc(uData);
            setPackageCredits(uData.packageCredits ?? (uData.clasesDisponibles ?? 4));
            setProgramTitle(uData.program || uData.programa || 'MPS One (Clases Individuales)');
          } else {
            // Documento base inicial
            const initData = {
              email: userEmail,
              name: session.username,
              packageCredits: 4,
              program: 'MPS One (Clases Individuales)',
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, initData);
            setStudentDoc(initData);
            setPackageCredits(4);
          }
        }
      } catch (err) {
        console.error('Error cargando perfil del alumno:', err);
      }
    };

    loadStudentProfile();
    return () => unsubUser();
  }, [session]);

  // 3. Listener en tiempo real de agenda_slots
  useEffect(() => {
    if (!session?.email) return;

    const unsub = onSnapshot(collection(db, 'agenda_slots'), (snapshot) => {
      const slots = snapshot.docs.map(doc => ({
        id: doc.id,
        students: [],
        ...doc.data()
      }));

      setAllSlots(slots);

      const userEmail = session.email.toLowerCase().trim();
      const userName = (session.username || '').toLowerCase().trim();

      // Mis clases programadas: donde figure mi correo, id o nombre
      const mine = slots.filter(s => {
        if (!s.students || !Array.isArray(s.students)) return false;
        return s.students.some(st => {
          const stEmail = (st.email || st.id || '').toLowerCase().trim();
          const stName = (st.name || '').toLowerCase().trim();
          return stEmail === userEmail || (userName.length >= 3 && stName === userName);
        });
      }).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA - dateB;
      });

      setMyBookedSlots(mine);

      // Clases disponibles para reservar:
      // REGLA 1 DE NEGOCIO: MÍNIMO 48 HORAS (2 DÍAS) DE ANTICIPACIÓN
      const now = new Date();
      const minBookingTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const available = slots.filter(s => {
        if (!s.date || !s.time) return false;
        const slotDate = new Date(`${s.date}T${s.time}`);
        if (slotDate < minBookingTime) return false; // Bloquea si falta menos de 48 horas

        // Que no esté ya inscrito el mismo alumno
        const alreadyIn = s.students && s.students.some(st => {
          const stEmail = (st.email || st.id || '').toLowerCase().trim();
          return stEmail === userEmail;
        });
        if (alreadyIn) return false;

        // Que haya cupo
        const currentCount = s.students?.length || 0;
        const maxCap = s.capacity || 1;
        return currentCount < maxCap;
      }).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      });

      setAvailableSlots(available);
    });

    return () => unsub();
  }, [session]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await auth.signOut();
    router.push('/');
  };

  // --- ACCIÓN: CONFIRMAR AGENDAMIENTO ---
  const handleConfirmBooking = async () => {
    if (!selectedSlotToBook || !session?.email) return;

    if (packageCredits <= 0) {
      alert("No tienes clases disponibles en tu paquete. Por favor renueva tu suscripción para continuar agendando.");
      return;
    }

    setBookingLoading(true);
    try {
      const slotRef = doc(db, 'agenda_slots', selectedSlotToBook.id);
      const studentObj = {
        id: session.email.toLowerCase().trim(),
        email: session.email.toLowerCase().trim(),
        name: studentDoc?.name || session.username,
        bookedAt: new Date().toISOString(),
        status: 'confirmado'
      };

      const updatedStudents = [...(selectedSlotToBook.students || []), studentObj];
      await updateDoc(slotRef, { students: updatedStudents });

      // Descontar 1 crédito de clase del paquete
      const newCredits = Math.max(0, packageCredits - 1);
      const userRef = doc(db, 'users', session.email.toLowerCase().trim());
      await updateDoc(userRef, { packageCredits: newCredits });
      setPackageCredits(newCredits);

      setBookingSuccessMsg(`¡Clase agendada con éxito para el ${selectedSlotToBook.date} a las ${selectedSlotToBook.time}!`);
      setTimeout(() => {
        setBookingSuccessMsg('');
        setShowBookModal(false);
        setSelectedSlotToBook(null);
      }, 2500);

    } catch (err) {
      console.error('Error al agendar clase:', err);
      alert('Ocurrió un error al confirmar tu reserva. Inténtalo de nuevo.');
    } finally {
      setBookingLoading(false);
    }
  };

  // --- ACCIÓN: INICIAR CANCELACIÓN (REGLA: 2 HORAS ANTES) ---
  const handleOpenCancelModal = (slot) => {
    setSlotToCancel(slot);
    const slotDateTime = new Date(`${slot.date}T${slot.time}`);
    const now = new Date();
    const diffHours = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Si falta 2 horas o más, es reembolsable. Si falta menos de 2 horas, no se reembolsa.
    setCancelRefundable(diffHours >= 2);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!slotToCancel || !session?.email) return;

    setCancelLoading(true);
    try {
      const userEmail = session.email.toLowerCase().trim();
      const updatedStudents = (slotToCancel.students || []).filter(st => {
        const stEmail = (st.email || st.id || '').toLowerCase().trim();
        return stEmail !== userEmail;
      });

      const slotRef = doc(db, 'agenda_slots', slotToCancel.id);
      await updateDoc(slotRef, { students: updatedStudents });

      // Si cumple la regla de las 2 horas de anticipación, reingresamos el crédito
      if (cancelRefundable) {
        const newCredits = packageCredits + 1;
        const userRef = doc(db, 'users', session.email.toLowerCase().trim());
        await updateDoc(userRef, { packageCredits: newCredits });
        setPackageCredits(newCredits);
      }

      setShowCancelModal(false);
      setSlotToCancel(null);
      alert(cancelRefundable 
        ? "Tu clase ha sido cancelada exitosamente y se ha reintegrado 1 crédito a tu saldo." 
        : "La clase ha sido cancelada de la agenda. Al haberse cancelado con menos de 2 horas de anticipación, se ha dado por consumida.");

    } catch (err) {
      console.error('Error al cancelar clase:', err);
      alert('Ocurrió un error al procesar la cancelación.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--accent)' }}>
        Cargando portal estudiantil...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem', color: 'var(--text-primary)' }}>
      
      {/* HEADER PRINCIPAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Portal Oficial Estudiantil • Escuela MPS
          </span>
          <h1 style={{ fontSize: '1.9rem', color: 'var(--text-primary)', margin: '0.2rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Book size={28} color="var(--accent)" />
            ¡Hola, <span style={{ color: 'var(--accent)' }}>{session.username}</span>!
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href="https://wa.me/573023557760"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(37, 211, 102, 0.1)',
              color: '#25d366',
              border: '1px solid rgba(37, 211, 102, 0.25)',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Phone size={15} /> Ayuda Coordinación
          </a>
          <button 
            onClick={handleLogout} 
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.25)', 
              color: '#ef4444', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontWeight: 'bold',
              fontSize: '0.85rem'
            }}
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>

      {/* BANNER DE REGLAS DE AGENDAMIENTO OFICIALES */}
      <div style={{
        background: 'rgba(0, 222, 133, 0.05)',
        border: '1px solid rgba(0, 222, 133, 0.2)',
        borderRadius: '12px',
        padding: '0.9rem 1.2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.8rem',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Clock size={18} color="var(--accent)" />
          <span>
            <strong>Políticas de Agenda MPS:</strong> Agendamiento con <strong>mínimo 2 días (48h)</strong> de anticipación • Cancelación con <strong>mínimo 2 horas</strong> antes para reintegrar tu clase.
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>
          ✓ Sistema Sincronizado
        </span>
      </div>

      {/* GRID PRINCIPAL: RESUMEN DE PAQUETE Y PRÓXIMAS CLASES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.8rem', marginBottom: '2.5rem' }}>
        
        {/* TARJETA 1: PROGRAMA ACTIVO Y CRÉDITOS DISPONIBLES */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', background: 'rgba(0,222,133,0.1)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                Matrícula Activa
              </span>
              <Sparkles size={18} color="var(--accent)" />
            </div>

            <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.4rem 0', fontWeight: 800 }}>
              {programTitle}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
              Gestiona tus sesiones individuales o grupales dentro del calendario oficial de Escuela MPS.
            </p>

            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: '12px',
              padding: '1.2rem',
              margin: '1.5rem 0',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Clases Disponibles:
                </span>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: packageCredits > 0 ? 'var(--accent)' : '#ef4444' }}>
                  {packageCredits} {packageCredits === 1 ? 'Clase' : 'Clases'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estado de Paquete:</span>
                <div style={{ color: packageCredits > 0 ? 'var(--accent)' : '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                  {packageCredits > 0 ? '● Cupos Vigentes' : '○ Requiere Renovación'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <button
              type="button"
              onClick={() => setShowBookModal(true)}
              disabled={packageCredits <= 0}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '10px',
                background: packageCredits > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                color: packageCredits > 0 ? '#000f11' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.95rem',
                border: 'none',
                cursor: packageCredits > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <PlusCircle size={18} />
              {packageCredits > 0 ? 'Agendar Nueva Clase' : 'Sin clases disponibles'}
            </button>

            <Link
              href="/checkout"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                background: 'transparent',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.88rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textAlign: 'center'
              }}
            >
              <CreditCard size={16} /> Renovar Paquete o Pagar Mes
            </Link>
          </div>
        </div>

        {/* TARJETA 2: MI AGENDA DE CLASES PROGRAMADAS */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Calendar size={24} color="var(--accent)" />
              <h3 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 800 }}>Mi Agenda de Clases</h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {myBookedSlots.length} {myBookedSlots.length === 1 ? 'sesión agendada' : 'sesiones agendadas'}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '360px', paddingRight: '0.3rem' }}>
            {myBookedSlots.length === 0 ? (
              <div style={{
                background: 'var(--bg-primary)',
                borderRadius: '12px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <Calendar size={36} color="var(--text-secondary)" style={{ opacity: 0.4, marginBottom: '0.8rem' }} />
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  Aún no tienes clases agendadas
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1.2rem 0' }}>
                  Selecciona una de tus clases disponibles con al menos 2 días de antelación para reservar tu sala.
                </p>
                <button
                  type="button"
                  onClick={() => setShowBookModal(true)}
                  disabled={packageCredits <= 0}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--accent)',
                    color: 'var(--accent)',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: packageCredits > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  Agendar Mi Primera Clase →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {myBookedSlots.map((slot) => {
                  const icon = getInstrumentIcon(slot.instrument);
                  const slotDateObj = new Date(`${slot.date}T${slot.time}`);
                  const formattedDate = slotDateObj.toLocaleDateString('es-CO', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  });

                  return (
                    <div
                      key={slot.id}
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.8rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'rgba(0, 222, 133, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.3rem'
                        }}>
                          {icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {slot.instrument || 'Clase de Música'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <User size={12} /> Profe: {slot.teacher || 'Asignado MPS'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                            <MapPin size={12} /> {slot.branch || 'Sede Principal'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                            {formattedDate}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)' }}>
                            {slot.time} ({slot.duration || 60}m)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(slot)}
                          title="Cancelar o reprogramar clase"
                          style={{
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* PANEL DE GOOGLE CLASSROOM (SEGUIMIENTO ACADÉMICO) */}
      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Book size={26} color="#00DE85" />
            <div>
              <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>
                Mis Procesos y Tareas (Google Classroom)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Material de estudio, partituras y seguimiento de tus clases en la escuela
              </p>
            </div>
          </div>

          <a
            href="https://classroom.google.com/h/tv"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(0, 222, 133, 0.1)',
              color: '#00DE85',
              border: '1px solid #00DE85',
              textDecoration: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            Abrir Classroom Oficial <ExternalLink size={14} />
          </a>
        </div>

        {loadingClassroom ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Cargando tus procesos académicos...
          </div>
        ) : classroomCourses.length === 0 ? (
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 1rem 0' }}>
              Aún no tienes aulas virtuales vinculadas con tu correo. Coordinación Académica activará tus materias tras tu primera sesión.
            </p>
            <a
              href="https://classroom.google.com/h/tv"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'underline'
              }}
            >
              Ir a Google Classroom con mi cuenta institucional →
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
            {classroomCourses.map(course => (
              <div
                key={course.id}
                style={{
                  background: 'var(--bg-primary)',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  padding: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--accent)', background: 'rgba(0,222,133,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      {course.section || 'Aula Activa'}
                    </span>
                    {course.teacher && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Profe: {course.teacher}
                      </span>
                    )}
                  </div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', margin: '0.3rem 0 0.5rem 0', fontWeight: 'bold' }}>
                    {course.name}
                  </h4>
                  {course.descriptionHeading && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4, margin: 0 }}>
                      {course.descriptionHeading}
                    </p>
                  )}
                </div>

                {course.courseWork && course.courseWork.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.8rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      Actividades Recientes:
                    </span>
                    {course.courseWork.slice(0, 2).map(cw => (
                      <div key={cw.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                          • {cw.title}
                        </span>
                        {cw.dueDate && (
                          <span style={{ color: '#00DE85' }}>
                            {cw.dueDate.day}/{cw.dueDate.month}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <a
                  href={course.alternateLink || 'https://classroom.google.com/h/tv'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  Entrar al Aula <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: AGENDAR NUEVA CLASE (REGLA 48 HORAS) */}
      {showBookModal && (
        <ModalOverlay isOpen={showBookModal} onClose={() => !bookingLoading && setShowBookModal(false)}>
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 800 }}>
                  Agendar Clase de Música
                </h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>
                  Regla de Agendamiento: Mínimo 2 días (48h) de anticipación
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {bookingSuccessMsg ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={50} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0' }}>¡Reserva Confirmada!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{bookingSuccessMsg}</p>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Selecciona uno de los horarios libres habilitados por Coordinación en la sede. Solo se muestran sesiones que cumplen la anticipación reglamentaria de 48 horas.
                </p>

                {availableSlots.length === 0 ? (
                  <div style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '10px',
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    border: '1px solid var(--glass-border)',
                    marginBottom: '1rem'
                  }}>
                    <Clock size={32} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '0.6rem' }} />
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem' }}>No hay horarios disponibles en este momento</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                      Las franjas de esta semana están ocupadas o faltan menos de 48 horas. Contáctanos por WhatsApp para solicitar que Coordinación te abra un cupo especial.
                    </p>
                    <a
                      href="https://wa.me/573023557760?text=Hola%20Coordinaci%C3%B3n%20MPS,%20quisiera%20agendar%20una%20clase%20y%20consultar%20disponibilidad"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: '#25d366',
                        color: '#ffffff',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Phone size={15} /> Solicitar Horario a Coordinación
                    </a>
                  </div>
                ) : (
                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.2rem' }}>
                    {availableSlots.map(slot => {
                      const isSelected = selectedSlotToBook?.id === slot.id;
                      const icon = getInstrumentIcon(slot.instrument);
                      const dObj = new Date(`${slot.date}T${slot.time}`);
                      const dStr = dObj.toLocaleDateString('es-CO', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short'
                      });

                      return (
                        <div
                          key={slot.id}
                          onClick={() => setSelectedSlotToBook(slot)}
                          style={{
                            background: isSelected ? 'rgba(0, 222, 133, 0.12)' : 'var(--bg-primary)',
                            border: isSelected ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                            borderRadius: '10px',
                            padding: '0.8rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                            <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                                {slot.instrument} • Profe {slot.teacher}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {slot.branch || 'Sede Principal'}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, textTransform: 'capitalize' }}>
                              {dStr}
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                              {slot.time} ({slot.duration || 60}m)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    disabled={bookingLoading}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-secondary)',
                      padding: '0.65rem 1.2rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cerrar
                  </button>

                  {availableSlots.length > 0 && (
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={!selectedSlotToBook || bookingLoading}
                      style={{
                        background: selectedSlotToBook ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                        color: selectedSlotToBook ? '#000f11' : 'var(--text-secondary)',
                        border: 'none',
                        padding: '0.65rem 1.4rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        cursor: selectedSlotToBook ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      {bookingLoading ? 'Reservando...' : 'Confirmar Reserva (1 Crédito)'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </ModalOverlay>
      )}

      {/* MODAL 2: CANCELAR CLASE (REGLA 2 HORAS) */}
      {showCancelModal && slotToCancel && (
        <ModalOverlay isOpen={showCancelModal} onClose={() => !cancelLoading && setShowCancelModal(false)}>
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={22} color={cancelRefundable ? '#f59e0b' : '#ef4444'} />
                <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>
                  Cancelar Sesión Agendada
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.2rem',
              border: '1px solid var(--glass-border)'
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                {slotToCancel.instrument} con Profe {slotToCancel.teacher}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Fecha: <strong>{slotToCancel.date}</strong> a las <strong>{slotToCancel.time}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '0.2rem' }}>
                Sede: {slotToCancel.branch || 'Sede Principal'}
              </div>
            </div>

            {cancelRefundable ? (
              <div style={{
                background: 'rgba(0, 222, 133, 0.08)',
                border: '1px solid rgba(0, 222, 133, 0.25)',
                borderRadius: '8px',
                padding: '0.9rem',
                marginBottom: '1.2rem',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5
              }}>
                <span style={{ fontWeight: 800, color: 'var(--accent)', display: 'block', marginBottom: '0.2rem' }}>
                  ✓ Cancelación con derecho a reembolso (Más de 2 horas antes)
                </span>
                Estás cancelando dentro del tiempo reglamentario. Al confirmar, <strong>se te devolverá 1 crédito de clase</strong> a tu saldo para que puedas reprogramarla cuando desees.
              </div>
            ) : (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '0.9rem',
                marginBottom: '1.2rem',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5
              }}>
                <span style={{ fontWeight: 800, color: '#ef4444', display: 'block', marginBottom: '0.2rem' }}>
                  ⚠️ Cancelación tardía (Menos de 2 horas de anticipación)
                </span>
                Faltan menos de 2 horas para el inicio de la clase. Según las políticas de la escuela, la sesión se cancelará para liberar la sala, pero <strong>se dará por consumida y no se reintegrará el crédito</strong>.
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                  padding: '0.65rem 1.2rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {cancelLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

    </div>
  );
}
