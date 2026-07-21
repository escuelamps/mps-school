"use client";

export default function FooterV3() {
  const facebookSvg = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  );

  const instagramSvg = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );


  const tiktokSvg = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
    </svg>
  );

  return (
    <>
      <footer style={{ padding: '4rem 5% 2rem 5%', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,15,17,0.5)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <img src="/images/logo2.png" alt="MPS Logo" style={{ height: '85px', opacity: 0.8 }} />
          
          {/* REDES SOCIALES */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <a href="https://www.facebook.com/escuelamps" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='white'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-secondary)'}>
              {facebookSvg}
            </a>
            <a href="https://www.instagram.com/escuelamps/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='white'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-secondary)'}>
              {instagramSvg}
            </a>
            <a href="https://www.tiktok.com/@escuelamps" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='white'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-secondary)'}>
              {tiktokSvg}
            </a>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          © 2026 MPS - Music and Production School. Todos los derechos reservados.
        </p>
      </footer>

      {/* BOTÓN WHATSAPP FLOTANTE */}
      <a href="https://wa.me/573008934407?text=Hola,%20vengo%20de%20la%20página%20web%20y%20quiero%20información%20sobre%20las%20clases" target="_blank" rel="noopener noreferrer" style={{ 
        position: 'fixed', bottom: '30px', right: '30px', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        width: '60px', height: '60px', background: '#25D366', color: 'white', 
        borderRadius: '50%', boxShadow: '0 10px 20px rgba(37,211,102,0.4)',
        transition: 'transform 0.3s ease'
      }} onMouseOver={(e)=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={(e)=>e.currentTarget.style.transform='scale(1)'} title="Escríbenos por WhatsApp">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
      </a>
    </>
  );
}
