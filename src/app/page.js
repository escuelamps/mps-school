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
          background: isOpen ? 'rgba(0,222,133,0.1)' : 'rgba(255,255,255,0.02)', 
          color: 'white', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', cursor: 'pointer', border: 'none', 
          fontSize: '1.2rem', fontWeight: 600, transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => { if(!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
        onMouseOut={(e) => { if(!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
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
        <div style={{ padding: '2rem 1.5rem', background: 'rgba(0,15,17,0.5)', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.7 }}>
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
    { nombre: "Andrea Restrepo", rol: "Mamá de alumno", texto: "Excelente academia. Llevé a mi hijo de 6 años para clases de piano y la paciencia del profesor es increíble. El material didáctico que usan hace que los niños aprendan jugando y se mantengan motivados.", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80" },
    { nombre: "Carlos Mendoza", rol: "Adulto, clases de guitarra", texto: "Empecé desde cero con la guitarra a mis 35 años y pensé que sería muy difícil. Los profesores de la Escuela MPS tienen un método excelente y las herramientas necesarias para que uno avance a su propio ritmo. Muy recomendados.", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80" },
    { nombre: "Camila Torres", rol: "Alumna a domicilio (Violín)", texto: "Tomo clases de violín a domicilio en la zona de Teusaquillo y resalto mucho el cumplimiento y profesionalismo del docente. Es una comodidad enorme que vayan hasta la casa y se adapten a mis horarios.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" },
    { nombre: "Juan Sebastián Gómez", rol: "Alumno de técnica vocal", texto: "Una gran experiencia. El trato humano y la dedicación de los profesores se nota desde la primera clase. Tienen toda la experiencia para guiarte sin importar tu nivel inicial.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
    { nombre: "Javier", rol: "Estudiante de Nuevo Ingreso", texto: "Muy contento de poder iniciar en esta nueva etapa de aprendizaje, felicitaciones, muy acogedora las instalaciones de la Academia, muchísimos éxitos y esperamos vernos pronto. Mil gracias", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
    { nombre: "Estudiante de Piano", rol: "Clases de Piano", texto: "Quiero expresar mi más sincero agradecimiento a la profesora Laura Pineda y a la Academia de Música MPS. Como estudiante de piano, he encontrado en la profesora Laura una excelente maestra, con amplios conocimientos musicales y una gran capacidad para enseñar. Su paciencia, dedicación y profesionalismo hacen que cada clase sea una experiencia agradable y motivadora. Gracias a su forma de explicar, he podido comprender mejor el instrumento y avanzar paso a paso con confianza. Siempre está dispuesta a resolver dudas y a motivar a sus estudiantes para que sigan mejorando. Recomiendo ampliamente la Academia de Música Mi Primer Sol a cualquier persona que desee aprender música en un ambiente serio, cálido y profesional. Es un lugar donde realmente se preocupan por el aprendizaje y el crecimiento de cada estudiante. ¡Muchas gracias, profesora Laura, por compartir su conocimiento y pasión por la música!", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80" },
    { nombre: "Daniela Vargas", rol: "Estudiante de Producción", texto: "Gracias a los equipos de la escuela pude grabar y mezclar mi primer EP profesional antes de graduarme.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" },
    { nombre: "Mateo Rincón", rol: "Egresado de Actuación", texto: "La metodología es 100% práctica. Aprendí a desenvolverme frente a la cámara y hoy en día trabajo en comerciales nacionales.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
    { nombre: "Valentina Gómez", rol: "Programa Infantil Musical", texto: "Inscribí a mi hija hace dos años en piano y el cambio en su disciplina y creatividad ha sido espectacular. ¡Súper recomendados!", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80" }
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
          <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>
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

      {/* METODOLOGÍA */}
      <section id="metodologia" style={{ padding: '5rem 5%', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Nuestra <span className="text-gradient">Metodología</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '3rem' }}>
            En MPS no solo enseñamos técnicas, formamos artistas integrales. Combinamos la teoría rigurosa con la 
            práctica constante en ensambles, estudios de grabación y escenarios reales. Creemos que la mejor forma 
            de aprender arte es viviéndolo desde el primer día.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'left' }}>
            <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>01. Práctica Real</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Prácticas desde el primer semestre en estudios profesionales y teatros.</p>
            </div>
            <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>02. Docentes Activos</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Aprende de profesionales que trabajan actualmente en la industria artística.</p>
            </div>
            <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>03. Enfoque Humano</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Grupos pequeños para garantizar atención personalizada y crecimiento integral.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMAS CON ACORDEÓN */}
      <section id="programas" style={{ padding: '6rem 5%', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Oferta <span className="text-gradient">Académica</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Conoce en detalle nuestro pensum y las modalidades de estudio para cada área artística.</p>
          </div>

          <AccordionItem title="Área de Música (Niños y Adultos)" defaultOpen={true}>
            <div className="responsive-grid-2" style={{ alignItems: 'center' }}>
              <div>
                <h4 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '1rem' }}>Especialidades</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <li>✅ Técnica Vocal y Canto</li>
                  <li>✅ Guitarra (Acústica y Eléctrica)</li>
                  <li>✅ Piano y Teclados</li>
                  <li>✅ Batería y Percusión</li>
                  <li>✅ Violín</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '1rem' }}>Metodología</h4>
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

      {/* CONTACTO */}
      <section style={{ padding: '6rem 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>¿Preparado para <span className="text-gradient">inscribirte</span>?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Nuestro equipo de admisiones te está esperando para resolver todas tus dudas.</p>
        <button onClick={() => setIsContactOpen(true)} className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '1rem' }}>
          <PhoneCall size={24} /> Contactar a un Asesor
        </button>
      </section>

      {/* DOCENTES */}
      <section id="docentes" style={{ padding: '6rem 5%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Nuestro <span className="text-gradient">Cuerpo Docente</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Aprende directamente de profesionales activos en la industria musical, actoral y audiovisual de Colombia.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {[
              { nombre: "Andrés Bernal", rol: "Profesor de Piano", img: "/images/andres_bernal_profesor_piano.JPG", desc: "Especialista en piano y desarrollo técnico." },
              { nombre: "Carlos Velásquez", rol: "Profesor de Actuación", img: "/images/carlos_velasquez_profesor_actuacion.JPG", desc: "Actor y pedagogo en expresión corporal." },
              { nombre: "Sebastián Vergara", rol: "Producción de Audio", img: "/images/sebastian_vergara_porfesor_guitarra_piano_produccion_audio.JPG", desc: "Especialista en producción de audio digital." },
              { nombre: "Shalom Melo", rol: "Profesora de Violín", img: "/images/shalom_melo_prieto_profesora_violin.JPG", desc: "Violinista enfocada en técnica y musicalidad." }
            ].map((docente, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s ease' }} onMouseOver={(e)=>e.currentTarget.style.transform='translateY(-10px)'} onMouseOut={(e)=>e.currentTarget.style.transform='translateY(0)'}>
                <img src={docente.img} alt={docente.nombre} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1.5rem auto', border: '3px solid var(--accent)' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{docente.nombre}</h3>
                <h4 style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '1rem' }}>{docente.rol}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{docente.desc}</p>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Link href="/docentes" style={{ 
              display: 'inline-block', 
              padding: '0.8rem 2rem', 
              border: '1px solid var(--accent)', 
              color: 'var(--accent)', 
              borderRadius: '50px', 
              textDecoration: 'none', 
              fontWeight: 600,
              transition: 'all 0.3s'
            }} onMouseOver={(e)=>{e.currentTarget.style.background='var(--accent)'; e.currentTarget.style.color='black'}} onMouseOut={(e)=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--accent)'}}>
              Ver Todo el Equipo Docente
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section style={{ padding: '6rem 5%', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Historias de <span className="text-gradient">Éxito</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Nuestros estudiantes son nuestra mejor carta de presentación. Conoce sus experiencias.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {testimonialsList.slice(0, showAllTestimonials ? testimonialsList.length : 3).map((testimonio, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.2rem', color: 'var(--accent)' }}>
                    {[1,2,3,4,5].map(star => <Star key={star} size={16} fill="currentColor" />)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '500' }}>
                    <CheckCircle2 size={12} />
                    <span>Reseña Certificada</span>
                  </div>
                </div>
                <p className="testimonial-scroll" style={{ color: 'white', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem', fontStyle: 'italic' }}>"{testimonio.texto}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem' }}>{testimonio.nombre}</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{testimonio.rol}</p>
                  </div>
                </div>
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
      <section id="ubicacion" style={{ padding: '0 0 4rem 0', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center' }}>
          <div style={{ padding: '4rem 5%' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Visita nuestras <span className="text-gradient">Instalaciones</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              Ven y conoce nuestros estudios de grabación, salas de ensayo insonorizadas y nuestro auditorio principal. 
              El mejor ambiente para desarrollar tu talento está aquí.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
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
