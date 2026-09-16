'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Book, Calendar, CreditCard, UploadCloud, CheckCircle, Smartphone } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { ModalOverlay } from '@/components/Modals';

export default function StudentPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [montoPago, setMontoPago] = useState('');
  const [showNequiModal, setShowNequiModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.username || data.role !== 'student') {
          router.push('/login');
        } else {
          setSession(data);
          setLoading(false);
        }
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await auth.signOut();
    router.push('/');
  };

  const handleSimularMercadoPago = () => {
    if (!montoPago || isNaN(montoPago) || Number(montoPago) <= 0) {
      alert("Por favor ingresa un monto válido a pagar.");
      return;
    }
    alert(`Redirigiendo de forma segura a Mercado Pago para cobrar $${Number(montoPago).toLocaleString()} COP...\n\n(Esta es una simulación visual. Cuando tengamos las llaves, esto abrirá la pasarela real con opciones de Tarjeta y PSE).`);
  };

  const handleSimularNequi = () => {
    if (!montoPago || isNaN(montoPago) || Number(montoPago) <= 0) {
      alert("Por favor ingresa el monto que pagaste antes de subir el recibo.");
      return;
    }
    setShowNequiModal(true);
  };

  const handleSubirRecibo = () => {
    setIsUploading(true);
    // Simular el tiempo que tardaría la IA en leer el recibo
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setShowNequiModal(false);
        alert('¡El sistema inteligente verificó tu pago exitosamente! Tus clases han sido habilitadas.');
      }, 2500);
    }, 3000);
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--rich-black)', color: 'var(--accent)' }}>Cargando portal...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem', color: 'var(--text-primary)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Book size={28} color="var(--accent)" /> Mi Portal Estudiantil
        </h1>
        <button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <LogOut size={18} /> Salir
        </button>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>¡Hola, <span style={{ color: 'var(--accent)' }}>{session.username.split('.')[0]}</span>!</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* PANEL DE PAGOS (PASARELA UNIFICADA) */}
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <CreditCard size={28} color="#0ea5e9" />
            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Gestión de Pagos</h3>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Como el valor de tu mensualidad depende de tus clases programadas, ingresa el monto a pagar:
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Monto a pagar (COP)</label>
            <input 
              type="number" 
              placeholder="Ej. 120000"
              value={montoPago}
              onChange={(e) => setMontoPago(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', fontSize: '1.2rem', fontWeight: 'bold' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* BOTON MERCADO PAGO */}
            <button 
              onClick={handleSimularMercadoPago}
              style={{ width: '100%', padding: '1rem', background: '#009ee3', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <CreditCard size={20} /> Pagar con Tarjeta o PSE
            </button>

            {/* BOTON NEQUI */}
            <button 
              onClick={handleSimularNequi}
              style={{ width: '100%', padding: '1rem', background: 'transparent', color: '#da0081', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', border: '2px solid #da0081', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <Smartphone size={20} /> Reportar Transferencia Nequi
            </button>
          </div>
        </div>

        {/* PANEL DE AGENDA / CLASES */}
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <Calendar size={28} color="var(--accent)" />
            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Mi Agenda</h3>
          </div>
          
          <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Aún no tienes clases agendadas para esta semana.</p>
            <button style={{ background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
              Solicitar Clase
            </button>
          </div>
        </div>

      </div>

      {/* MODAL NEQUI */}
      {showNequiModal && (
        <ModalOverlay isOpen={showNequiModal} onClose={() => !isUploading && setShowNequiModal(false)}>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Nequi_Logo.webp/1024px-Nequi_Logo.webp.png" alt="Nequi" style={{ height: '40px', marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Paga con Nequi</h2>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              1. Abre tu app y transfiere <strong>${Number(montoPago).toLocaleString()}</strong> al número:
            </p>
            
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px dashed #da0081', display: 'inline-block', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#da0081', letterSpacing: '2px' }}>302 355 7760</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              2. Toma un pantallazo del comprobante exitoso y súbelo aquí:
            </p>

            <div style={{ border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '2rem', background: 'var(--bg-primary)', cursor: 'pointer', marginBottom: '2rem', position: 'relative' }}>
              {uploadSuccess ? (
                <div style={{ color: '#00DE85', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={40} />
                  <strong>¡Recibo Válido!</strong>
                </div>
              ) : isUploading ? (
                <div style={{ color: 'var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="loader" style={{ borderTopColor: 'var(--accent)', width: '30px', height: '30px', borderRadius: '50%', border: '3px solid rgba(0,222,133,0.3)' }}></div>
                  <span>La Inteligencia Artificial está leyendo el comprobante...</span>
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <UploadCloud size={30} />
                  <span>Haz clic o arrastra la imagen del comprobante</span>
                </div>
              )}
            </div>

            <button 
              onClick={handleSubirRecibo}
              disabled={isUploading || uploadSuccess}
              style={{ width: '100%', padding: '1rem', background: '#da0081', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', cursor: (isUploading || uploadSuccess) ? 'not-allowed' : 'pointer', opacity: (isUploading || uploadSuccess) ? 0.6 : 1 }}
            >
              {isUploading ? 'Verificando...' : 'Subir Comprobante y Validar'}
            </button>
          </div>
        </ModalOverlay>
      )}

    </div>
  );
}
