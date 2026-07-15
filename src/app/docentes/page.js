"use client";
import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import FooterV3 from '@/components/FooterV3';
import HeaderV3 from '@/components/HeaderV3';

export default function DocentesV3() {
  const [selectedDocente, setSelectedDocente] = useState(null);

  const docentes = [
    { nombre: "Andrés Bernal", rol: "Profesor de Piano", img: "/images/andres_bernal_profesor_piano.JPG", desc: "Especialista en piano, enfocado en el desarrollo técnico e interpretativo musical.", especialidad: "Piano", bio: "Andrés guía a sus estudiantes a través de una metodología sólida para el dominio del teclado, abarcando desde fundamentos clásicos hasta repertorio contemporáneo." },
    { nombre: "Andrés Felipe Pardo", rol: "Profesor de Composición, Piano y Guitarra", img: "/images/andres_felipe_pardo_profesor_musica.png", desc: "Músico Profesional con énfasis en Composición. Más de cinco años de experiencia formando en piano, guitarra, técnica vocal y teoría musical.", especialidad: "Composición & Instrumentos", bio: "Andrés es Músico Profesional de la Universidad Nacional de Colombia con énfasis en Composición. Cuenta con más de cinco años de experiencia formando niños, jóvenes y adultos en piano, guitarra, técnica vocal y teoría musical. Su trayectoria también incluye la participación en importantes agrupaciones como el Coro Filarmónico Juvenil de la Orquesta Filarmónica de Bogotá y la Sociedad Coral de la Orquesta Sinfónica de Bogotá. Como docente de nuestra academia, Andrés desarrolla una metodología dinámica y personalizada que fortalece las habilidades musicales desde la comprensión, la creatividad y la práctica. Sus clases están diseñadas para que cada estudiante aprenda a su propio ritmo, fortaleciendo la técnica, la sensibilidad artística y la confianza para interpretar música con seguridad. Su experiencia en pedagogía musical, dirección de ensambles y trabajo con la primera infancia le permite crear espacios de aprendizaje motivadores, donde cada alumno descubre el placer de hacer música mientras desarrolla disciplina, expresión y amor por el arte. 🎹🎤🎸🎶" },
    { nombre: "Carlos Macía", rol: "Profesor de Violín y Técnica Vocal", img: "/images/carlos_macia_profesor_violin_tecnica_vocal.JPG", desc: "Músico versátil con amplia experiencia en interpretación del violín y formación vocal.", especialidad: "Violín & Canto", bio: "Carlos es Licenciado en Educación Musical y violinista con una sólida trayectoria en la formación artística infantil y juvenil. Su experiencia incluye el Sistema de Orquestas de Venezuela, la Fundación Nacional Batuta y diversos proyectos sinfónicos y culturales en Colombia, donde ha sido docente, director de orquesta e instructor musical. Como docente de nuestra academia, comparte una metodología que combina la técnica musical con el desarrollo artístico y humano. Sus clases fortalecen la disciplina, el trabajo en equipo y la sensibilidad musical, permitiendo que cada estudiante avance de acuerdo con su edad, nivel y ritmo de aprendizaje. Su experiencia en procesos orquestales y corales hace de cada sesión un espacio dinámico donde los estudiantes aprenden a interpretar, escuchar y disfrutar la música desde el primer día. Con él descubrirán que la música es mucho más que tocar un instrumento: es una herramienta para crecer, expresarse y desarrollar todo su potencial. 🎻🎼✨" },
    { nombre: "Carlos Velásquez", rol: "Profesor de Actuación", img: "/images/carlos_velasquez_profesor_actuacion.JPG", desc: "Actor y pedagogo escénico. Especialista en expresión corporal y técnicas interpretativas.", especialidad: "Actuación", bio: "Carlos brinda herramientas actorales para televisión, teatro y medios digitales, conectando la emoción genuina con el dominio escénico." },
    { nombre: "Jenny Rojas", rol: "Profesora de Piano y Técnica Vocal", img: "/images/jenny_rojas_profesora_piano_tecnica_vocal.jpg", desc: "Maestra en música con profundo conocimiento en la formación de cantantes y pianistas.", especialidad: "Piano & Canto", bio: "Su experiencia le permite guiar el desarrollo de una voz sana y potente, combinando sus clases con un sólido acompañamiento desde el piano." },
    { nombre: "Jhonnathan Wagner", rol: "Profesor de Bajo", img: "/images/jhonnathan_wagner_profesor_bajo.JPG", desc: "Especialista en el bajo eléctrico, abarcando diversos géneros desde el rock hasta el ensamble contemporáneo.", especialidad: "Bajo Eléctrico", bio: "Jhonnathan es músico profesional con una destacada trayectoria nacional e internacional como bajista, director musical y docente. Ha compartido escenario con reconocidos artistas de talla mundial y ha participado en producciones musicales a bordo de prestigiosas compañías de cruceros internacionales como Virgin Voyages y Holland America Line, consolidando una amplia experiencia artística y profesional. Como docente de nuestra academia, pone toda esa experiencia al servicio de sus estudiantes, ofreciendo clases dinámicas donde la técnica, la creatividad y la interpretación musical se desarrollan de forma práctica y cercana. Su metodología se adapta a las necesidades y objetivos de cada alumno, fortaleciendo la confianza, la disciplina y el disfrute por la música desde las primeras clases. Con más de quince años de experiencia en la enseñanza de bajo eléctrico, guitarra, piano y teoría musical, ha formado músicos de diferentes edades y niveles, inspirándolos a desarrollar su talento con bases sólidas y una visión profesional del arte. En nuestra academia encontrarás en él un maestro apasionado, comprometido y dispuesto a acompañar a cada estudiante en su crecimiento musical. 🎸🎹🎼✨" },
    { nombre: "Kevin Peña", rol: "Asesor Jurídico y Marketing", img: "/images/kevin_penia_juridico_asesormarketing.JPG", desc: "Especialista en desarrollo estratégico de marca y aspectos legales para artistas.", especialidad: "Marketing & Legal", bio: "Kevin aporta su visión estratégica para que los artistas de la escuela MPS comprendan el negocio de la música, los derechos de autor y cómo posicionar su proyecto en el mundo real." },
    { nombre: "Laura Ximena Mendoza", rol: "Profesora de Técnica Vocal", img: "/images/laura_ximena_mendoza_profesora_tecnica_volcal_instituciones.JPG", desc: "Especializada en coros y proyectos vocales en instituciones. Gran capacidad pedagógica y manejo de grupos.", especialidad: "Técnica Vocal", bio: "Laura tiene un talento excepcional para formar ensambles vocales. Su trabajo garantiza que la voz se proyecte correctamente cuidando la salud de las cuerdas vocales." },
    { nombre: "Sebastián Vergara", rol: "Profesor de Cuerdas y Producción", img: "/images/sebastian_vergara_porfesor_guitarra_piano_produccion_audio.JPG", desc: "Multinstrumentista y productor. Especialista en guitarra, piano y producción de audio digital.", especialidad: "Producción & Instrumentos", bio: "La visión moderna de Sebastián integra la ejecución instrumental con las últimas herramientas de producción, ideal para formar artistas que componen y producen sus propias canciones." },
    { nombre: "Shalom Melo Prieto", rol: "Profesora de Violín", img: "/images/shalom_melo_prieto_profesora_violin.JPG", desc: "Violinista con gran sensibilidad y paciencia para enseñar a todos los niveles.", especialidad: "Violín", bio: "Shalom es Maestra en Artes Musicales con énfasis en Violín de la Facultad de Artes ASAB de la Universidad Distrital Francisco José de Caldas. Desde muy pequeña inició su formación musical y ha construido una destacada trayectoria participando en importantes festivales, ensambles y proyectos sinfónicos, compartiendo escenario con la Orquesta Filarmónica de Bogotá, el Mariachi Vargas de Tecalitlán y el maestro Jorge Velosa. Actualmente también integra la Nuevo Mundo Orquesta Latinoamericana, con la que realizó su primera gira internacional en Canadá. Como docente de nuestra academia, Shalom acompaña a cada estudiante con una metodología cercana, paciente y motivadora, adaptando el aprendizaje a las necesidades y ritmo de cada alumno. Sus clases fortalecen la técnica, la sensibilidad musical y la confianza, permitiendo que niños, jóvenes y adultos disfruten del proceso de aprender un instrumento desde el primer día. Su pasión por las músicas tradicionales, la interpretación en ensambles y la formación artística hacen que cada sesión sea una experiencia enriquecedora, donde la disciplina, la creatividad y el amor por la música se convierten en los principales protagonistas. 🎻🎶✨" }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--rich-black)', paddingBottom: '4rem' }}>
      <HeaderV3 />

      {/* HERO DOCENTES */}
      <section style={{ padding: '4rem 5%', textAlign: 'center', background: 'radial-gradient(circle at 50% 0%, rgba(0,222,133,0.1) 0%, transparent 60%)' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Conoce a nuestros <span className="text-gradient">Profesores</span></h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          La Escuela MPS cuenta con un grupo selecto de instructores. Todos son profesionales activos en la industria con años de experiencia pedagógica y artística.
        </p>
      </section>

      {/* GRID DE DOCENTES COMPLETO */}
      <section style={{ padding: '2rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {docentes.map((docente, i) => (
            <div key={i} style={{ 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              border: '1px solid rgba(255,255,255,0.05)', 
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }} 
            onClick={() => setSelectedDocente(docente)}
            onMouseOver={(e)=>{
              e.currentTarget.style.transform='translateY(-10px)';
              e.currentTarget.style.boxShadow='0 20px 40px rgba(0,222,133,0.1)';
            }} 
            onMouseOut={(e)=>{
              e.currentTarget.style.transform='translateY(0)';
              e.currentTarget.style.boxShadow='none';
            }}>
              <div style={{ position: 'relative', height: '300px' }}>
                <img src={docente.img} alt={docente.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: docente.imgPos || 'top center' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
                  <span style={{ background: 'var(--accent)', color: 'black', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {docente.especialidad}
                  </span>
                </div>
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{docente.nombre}</h3>
                <h4 style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 500 }}>{docente.rol}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, flex: 1 }}>{docente.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SLIDE-OVER SIDEBAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
        zIndex: 100,
        opacity: selectedDocente ? 1 : 0,
        pointerEvents: selectedDocente ? 'auto' : 'none',
        transition: 'opacity 0.3s ease'
      }} onClick={() => setSelectedDocente(null)}>
        
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: '450px',
          background: 'var(--bg-secondary)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          transform: selectedDocente ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto'
        }} onClick={(e) => e.stopPropagation()}>
          
          {selectedDocente && (
            <>
              <button 
                onClick={() => setSelectedDocente(null)}
                style={{
                  position: 'absolute', top: '1.5rem', right: '1.5rem',
                  background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                  width: '40px', height: '40px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 10
                }}
              >
                <X size={20} />
              </button>

              <div style={{ position: 'relative', height: '350px' }}>
                <img src={selectedDocente.img} alt={selectedDocente.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: selectedDocente.imgPos || 'top center' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(transparent, var(--bg-secondary))' }}></div>
              </div>

              <div style={{ padding: '0 2.5rem 3rem 2.5rem', marginTop: '-2rem', position: 'relative', zIndex: 5 }}>
                <span style={{ display: 'inline-block', background: 'var(--accent)', color: 'black', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  {selectedDocente.especialidad}
                </span>
                
                <h2 style={{ fontSize: '2rem', marginBottom: '0.2rem', color: 'white' }}>{selectedDocente.nombre}</h2>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent)', fontWeight: 500, marginBottom: '2rem' }}>{selectedDocente.rol}</h3>
                
                <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Perfil Profesional</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                  {selectedDocente.bio}
                </p>

                <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Resumen</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
                  {selectedDocente.desc}
                </p>
                
                <button 
                  style={{ width: '100%', marginTop: '3rem', padding: '1rem', borderRadius: '50px', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseOver={(e)=>{e.currentTarget.style.background='var(--accent)'; e.currentTarget.style.color='black'}}
                  onMouseOut={(e)=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--accent)'}}
                  onClick={() => window.location.href='/#programas'}
                >
                  Ver Programas Relacionados
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <FooterV3 />
    </div>
  );
}
