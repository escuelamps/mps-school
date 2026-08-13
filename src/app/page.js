"use client";
import { useState } from 'react';
import Link from 'next/link';
import { PhoneCall, CheckCircle2, ArrowRight, Star } from 'lucide-react';
import { ContactModal } from '@/components/Modals';
import FooterV3 from '@/components/FooterV3';
import HeaderV3 from '@/components/HeaderV3';

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', transition: 'all 0.3s ease' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', padding: '1.5rem', 
          background: isOpen ? 'rgba(0,222,133,0.1)' : 'var(--panel-bg)', 
          color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', cursor: 'pointer', border: 'none', 
          fontSize: '1.2rem', fontWeight: 600, transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => { if(!isOpen) e.currentTarget.style.background = 'var(--glass-border)' }}
        onMouseOut={(e) => { if(!isOpen) e.currentTarget.style.background = 'var(--panel-bg)' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
          {title}
        </span>
        <span style={{ fontSize: '1.5rem', color: 'var(--accent)', fontWeight: 300 }}>{isOpen ? '−' : '+'}</span>
      </button>
      <div style={{ 
        maxHeight: isOpen ? '1000px' : '0', 
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.4s ease-in-out'
      }}>
        <div style={{ padding: '2rem 1.5rem', background: 'var(--accordion-bg)', color: 'var(--text-secondary)', borderTop: '1px solid var(--glass-border)', lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default function V3Page() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);

  const testimonialsList = [
    { nombre: "JHON ALEXANDER PACHECO DUARTE", rol: "Hace 25 semanas", texto: "Hola buenas tardes Quiero contarles que la experiencia de hoy fue excelente mi hijo quedó muy contento 🫶👏🏻👏🏻👏🏻" },
    { nombre: "Sofi Rojas", rol: "23 may 2025", texto: "Mi más sincero agradecimiento a la Academia *Mi primer Sol* por todo lo que ha hecho por mí. Su paciencia y dedicación son verdaderamente inspiradoras. Agradezco enormemente su empeño en encontrar métodos de aprendizaje que se adapten a mis necesidades y su habilidad para hacer que cada clase sea interesante y enriquecedora." },
    { nombre: "Yeny Delgadillo", rol: "23 may 2025", texto: "Es una escuela maravillosa, excelente la profesora Laurita, nos encanta como enseña!" },
    { nombre: "juc Al", rol: "20 may 2025", texto: "Mi hija a aprendido muchísimo con la.profe laura ... estoy feliz por.los.avances .. y seguiré con esta escuela" },
    { nombre: "MARCELA TORRES", rol: "20 may 2025", texto: "Excelentes clases tanto virtuales como presenciales, Laura muy buena profesora sabe como enseñar a los niños es muy amable y amorosa con ellos, estamos felices" },
    { nombre: "juancho lopez", rol: "16 may 2025", texto: "Gran escuela, profesores de alta calidad me ayudaron a maximizar mis habilidades musicales" },
    { nombre: "Carolina Perez", rol: "16 may 2025", texto: "" },
    { nombre: "Javier Bonilla", rol: "16 may 2025", texto: "La mejor escuela, retomar la música es lo mejor" },
    { nombre: "Carlos Florez", rol: "16 may 2025", texto: "Excelentes profesionales, con una metodología única para cada estudiante" },
    { nombre: "ELBER CAMILO CORTES MORALES", rol: "16 may 2025", texto: "Mi hijo toma clase con ellos, aprende de una forma interactiva y creativa, se siente el amor y el gusto con el que hacen su trabajo" },
    { nombre: "Kelly Vargas Rojas", rol: "16 may 2025", texto: "" },
    { nombre: "Mariana González", rol: "16 may 2025", texto: "Excelente escuela. La mejor profesora del mundo! Super paciente, se ajusta a mis horarios y a mis gustos musicales. Muy recomendada!!" },
    { nombre: "Cheo Piano", rol: "16 may 2025", texto: "Una enseñanza personalizada, innovadora. Felicitaciones. 👏" },
    { nombre: "Laura Stefania Quintero Castro", rol: "15 may 2025", texto: "Excelente escuela de música, los profesores son muy dedicados con el proceso de cada estudiante y se esfuerzan por enseñar con amor y dedicación." },
    { nombre: "Karolina Perez", rol: "15 may 2025", texto: "" },
    { nombre: "Jorge Andrés García Castillo", rol: "15 may 2025", texto: "La escuela mi primer sol es el lugar indicado para comenzar a aprender el instrumento musical que siempre haz querido aprender los profesores cuentan con la experiencia, herramientas y todo el material para tu aprendizaje. Allí encontrarás clases de iniciación musical, guitarra, piano, batería entro otros instrumentos. También tienen diferentes modalidades de clase tanto presencial como virtual no esperes más contáctate con ellos y comienza tu camino musical!!" }
  ];

  return (
    <>
      <HeaderV3 />

      {/* HERO INSTITUCIONAL */}
      <section className="responsive-grid-2" style={{ 
        padding: '6rem 5%', 
        alignItems: 'center',
        minHeight: '75vh',
        background: 'radial-gradient(circle at 100% 50%, rgba(0,222,133,0.08) 0%, transparent 60%)'
      }}>
        <div>
          <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'var(--glass-border)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>
            Formación Artística Integral
          </div>
          <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '2rem' }}>
            Potencia tu <br/><span className="text-gradient">talento</span> con profesionales.
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6, maxWidth: '90%' }}>
            Music And Production School te guiará por un viaje de descubrimiento artístico. Ofrecemos programas estructurados en música, actuación, modelaje y fotografía para todas las edades.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setIsContactOpen(true)} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Iniciar Proceso <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <img src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80" alt="Academia de Música" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ width: '50px', height: '50px', background: 'rgba(0,222,133,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 color="var(--accent)" size={28} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem' }}>+15 Años</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Formando artistas</p>
            </div>
          </div>
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section id="quienes-somos" style={{ padding: '5rem 5%', background: 'var(--section-bg)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Quiénes <span className="text-gradient">Somos</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
            En Music and Production School (MPS) somos una familia apasionada por el arte. 
            Nos dedicamos a formar artistas integrales, combinando la teoría con la práctica constante en escenarios y estudios reales. 
            Creemos que la mejor forma de aprender es viviéndolo desde el primer día.
          </p>
          <Link href="/quienes-somos" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            Conoce a nuestro equipo <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* PROGRAMAS CON ACORDEÓN */}
      <section id="programas" style={{ padding: '6rem 5%', background: 'var(--panel-bg)', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Oferta <span className="text-gradient">Académica</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Conoce en detalle nuestro pensum y las modalidades de estudio para cada área artística.</p>
          </div>

          <AccordionItem title="Área de Música (Niños y Adultos)" defaultOpen={true}>
            <div className="responsive-grid-2" style={{ alignItems: 'center' }}>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '1rem' }}>Especialidades</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <li>✅ Técnica Vocal y Canto</li>
                  <li>✅ Guitarra (Acústica y Eléctrica)</li>
                  <li>✅ Bajo</li>
                  <li>✅ Piano y Teclados</li>
                  <li>✅ Batería, Percusión y Marimba</li>
                  <li>✅ Violín</li>
                  <li>✅ Instrumentos de Viento (Saxo, Clarinete, Flauta, Traverso)</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '1rem' }}>Metodología</h4>
                <p>Nuestras clases pueden ser personalizadas o grupales. Para niños (2 a 4 años) aplicamos estimulación temprana e iniciación musical con metodologías lúdicas probadas mundialmente.</p>
                <Link href="/programas/musica" className="btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', fontSize: '0.9rem', display: 'inline-block', textDecoration: 'none' }}>Ver más</Link>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem title="Producción Musical & DJ">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'center' }}>
              <div>
                <p style={{ marginBottom: '1rem' }}>Aprende a crear, mezclar y masterizar música desde cero. Utilizando software estándar de la industria como Ableton Live, Logic Pro y FL Studio.</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <li>🎛️ Síntesis de sonido</li>
                  <li>🎚️ Mezcla y Masterización</li>
                  <li>💿 Técnicas de DJing profesional</li>
                </ul>
                <Link href="/programas/produccion" className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', display: 'inline-block', textDecoration: 'none' }}>Ver más</Link>
              </div>
              <div>
                <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&q=80" alt="Producción" style={{ width: '100%', borderRadius: '12px', objectFit: 'cover' }} />
              </div>
            </div>
          </AccordionItem>

          <AccordionItem title="Actuación y Modelaje">
             <p style={{ marginBottom: '1rem' }}>Desarrolla tu expresión corporal, seguridad en escena y técnicas vocales para la actuación teatral o audiovisual.</p>
             <p style={{ marginBottom: '1.5rem' }}>Nuestro programa de modelaje se enfoca no solo en pasarela, sino en etiqueta, protocolo, fotografía y construcción de marca personal.</p>
             <Link href="/programas/actuacion" className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', display: 'inline-block', textDecoration: 'none' }}>Ver más</Link>
          </AccordionItem>

          <AccordionItem title="Fotografía y Medios Digitales">
             <p style={{ marginBottom: '1.5rem' }}>Aprende el manejo manual de cámaras réflex (DSLR y Mirrorless), iluminación de estudio, composición y revelado digital en Lightroom y Photoshop. Cursos para principiantes y módulos avanzados de fotografía de producto y retrato.</p>
             <Link href="/programas/fotografia" className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', display: 'inline-block', textDecoration: 'none' }}>Ver más</Link>
          </AccordionItem>
        </div>
      </section>





      {/* TESTIMONIOS */}
      <section style={{ padding: '6rem 5%', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Nuestras <span className="text-gradient">reseñas</span></h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {testimonialsList.slice(0, showAllTestimonials ? testimonialsList.length : 6).map((testimonio, i) => (
              <div key={i} style={{ background: 'var(--panel-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--glass-border)', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  {testimonio.img ? (
                    <img src={testimonio.img} alt={testimonio.nombre} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {testimonio.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 style={{ margin: '0 0 0.1rem 0', fontSize: '0.95rem' }}>{testimonio.nombre}</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{testimonio.rol}</p>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <svg viewBox="0 0 48 48" width="20" height="20">
                      <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20C44 22.659 43.862 21.35 43.611 20.083z"/>
                      <path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                      <path fill="#FBBC05" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                      <path fill="#EA4335" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24C44 22.659 43.862 21.35 43.611 20.083z"/>
                    </svg>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.1rem', color: '#fbbc04', marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map(star => <Star key={star} size={14} fill="currentColor" stroke="none" />)}
                </div>
                <p className="testimonial-scroll" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{testimonio.texto}</p>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button 
              onClick={() => setShowAllTestimonials(!showAllTestimonials)}
              style={{ 
                background: 'transparent',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                padding: '1rem 3rem',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'var(--accent)';
                e.target.style.color = '#000';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--accent)';
              }}
            >
              {showAllTestimonials ? 'Ver menos' : 'Ver más historias de éxito'}
            </button>
          </div>
        </div>
      </section>

      {/* UBICACIÓN Y MAPA */}
      <section id="ubicacion" style={{ padding: '0 0 4rem 0', background: 'var(--section-bg)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center' }}>
          <div style={{ padding: '4rem 5%' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Visita nuestras <span className="text-gradient">Instalaciones</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              Ven y conoce nuestros estudios de grabación, salas de ensayo insonorizadas y nuestro auditorio principal. 
              El mejor ambiente para desarrollar tu talento está aquí.
            </p>
            <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>Sede Principal</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Music and Production School</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Dirección: Carrera 17#58a-37 Chapinero, Bogotá</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Horario de atención:<br/>Lunes a Viernes: 8:00 AM - 8:00 PM<br/>Sábados: 9:00 AM - 4:00 PM</p>
            </div>
          </div>
          <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <iframe 
              src="https://maps.google.com/maps?q=4.6461109,-74.0685269&z=16&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      <FooterV3 />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
