"use client";

import { useState } from 'react';
import Link from 'next/link';
import HeaderV3 from '@/components/HeaderV3';
import FooterV3 from '@/components/FooterV3';
import { ContactModal } from '@/components/Modals';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Music, 
  Sliders, 
  Video, 
  Camera, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Award, 
  Users, 
  Headphones,
  CalendarCheck
} from 'lucide-react';
import './cursos.css';

// WhatsApp base URL para inscripciones
const WHATSAPP_URL = "https://wa.me/573008934407";

// 4 Grandes Áreas para el Spotlight (Carrusel interactivo)
const SPOTLIGHT_AREAS = [
  {
    id: 'musica',
    tag: 'Formación Instrumental & Vocal',
    name: 'Área de Música (Niños, Jóvenes y Adultos)',
    summary: 'Aprende técnica vocal y el instrumento que te apasiona a través de una metodología práctica desde el primer día. Espacios insonorizados, repertorio personalizado y ensambles en vivo.',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80',
    highlights: [
      'Clases 1 a 1 personalizadas o talleres grupales',
      'Canto, Piano, Guitarra, Batería, Bajo, Violín y Vientos',
      'Estimulación temprana e iniciación para niños (2 a 4 años)',
      'Preparación para recitales y presentaciones en vivo semestrales'
    ],
    mode: 'Presencial / Personalizado',
    linkMessage: 'Hola MPS! Deseo recibir información sobre las clases del Área de Música.'
  },
  {
    id: 'produccion',
    tag: 'Tecnología & Creación Sonora',
    name: 'Producción Musical',
    summary: 'Domina los estándares de la industria del audio. Crea beats, graba instrumentos acústicos, realiza síntesis de audio, mezcla y masterización con software profesional.',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80',
    highlights: [
      'Ableton Live, Logic Pro y FL Studio en estudios equipados',
      'Síntesis analógica, diseño de sonido y samples',
      'Mezcla profesional con monitores de estudio e interfaces',
      'Masterización y estándares de streaming digital'
    ],
    mode: 'Estudio Profesional MPS',
    linkMessage: 'Hola MPS! Me interesa el programa de Producción Musical.'
  },
  {
    id: 'actuacion',
    tag: 'Artes Escénicas & Expresión',
    name: 'Actuación y Artes Escénicas',
    summary: 'Desarrolla seguridad escénica, dominio del cuerpo y voz tanto en teatro como frente a la cámara con directores y formadores de amplia trayectoria.',
    image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=1200&q=80',
    highlights: [
      'Expresión corporal, dicción y entrenamiento vocal escénico',
      'Actuación teatral y técnicas frente a la cámara audiovisual',
      'Construcción de personajes y escenas teatrales',
      'Preparación para castings y audiciones actorales'
    ],
    mode: 'Sala de Expresión y Escenario',
    linkMessage: 'Hola MPS! Quiero conocer más del programa de Actuación y Artes Escénicas.'
  }
  /* Fotografía oculto temporalmente
  {
    id: 'fotografia',
    tag: 'Imagen Visual & Revelado',
    name: 'Fotografía y Medios Digitales',
    summary: 'Aprende a controlar la luz y a dominar tu cámara en modo 100% manual. Desde retratos y fotografía de producto hasta revelado digital y retoque profesional en Lightroom y Photoshop.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80',
    highlights: [
      'Manejo manual total de cámaras DSLR y Mirrorless',
      'Iluminación de estudio: flashes de estudio, cajas de luz y reflectores',
      'Composición artística, retrato, producto y eventos en vivo',
      'Flujo de revelado RAW en Adobe Lightroom y retoque en Photoshop'
    ],
    mode: 'Estudio de Fotografía MPS',
    linkMessage: 'Hola MPS! Deseo información sobre los cursos de Fotografía y Medios Digitales.'
  }
  */
];

// Catálogo completo de cursos individuales (100% alineados a la landing page)
const COURSES_CATALOG = [
  {
    id: 'canto',
    category: 'musica',
    tag: 'Música • Voz',
    title: 'Técnica Vocal y Canto',
    desc: 'Desarrolla tu voz de forma saludable con técnicas de respiración diafragmática, afinación, colocación, resonancia y presencia en el escenario.',
    skills: [
      'Control respiratorio y apoyo diafragmático',
      'Ampliación del rango vocal y afinación precisa',
      'Interpretación y expresión escénica',
      'Repertorio personalizado a tu estilo musical'
    ],
    level: 'Todos los niveles',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80'
  },
  {
    id: 'piano',
    category: 'musica',
    tag: 'Música • Teclados',
    title: 'Piano y Teclados',
    desc: 'Desde la lectura musical y postura de manos hasta acordes contemporáneos, armonía moderna e improvisación para acompañarte o tocar en banda.',
    skills: [
      'Independencia de manos y digitación ágil',
      'Armonía moderna, acordes y cifrado',
      'Lectura de partituras y desarrollo auditivo',
      'Repertorio clásico, pop, jazz o latino'
    ],
    level: 'Principiante a Avanzado',
    image: 'https://images.unsplash.com/photo-1520523839898-507127050587?w=600&q=80'
  },
  {
    id: 'guitarra',
    category: 'musica',
    tag: 'Música • Cuerdas',
    title: 'Guitarra (Acústica y Eléctrica)',
    desc: 'Aprende rasgueos, arpegios, escalas, solos y teoría aplicada en guitarra acústica, electroacústica o eléctrica con amplificación profesional.',
    skills: [
      'Ritmos, rasgueos y técnica de plectro o dedos',
      'Escalas pentatónicas, modos y solos',
      'Efectos, pedales y tonos de guitarra',
      'Acompañamiento y ensamble con otros instrumentos'
    ],
    level: 'Principiante a Avanzado',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80'
  },
  {
    id: 'bateria',
    category: 'musica',
    tag: 'Música • Percusión',
    title: 'Batería, Percusión y Marimba',
    desc: 'Desarrolla coordinación de extremidades, tempo constante, dinámicas y grooves para cualquier género musical en baterías acústicas profesionales.',
    skills: [
      'Independencia de 4 extremidades y postura',
      'Lectura rítmica, rudimentos y paradiddles',
      'Grooves para rock, pop, funk, jazz y ritmos latinos',
      'Práctica con metrónomo y acompañamiento en vivo'
    ],
    level: 'Todos los niveles',
    image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&q=80'
  },
  {
    id: 'bajo',
    category: 'musica',
    tag: 'Música • Cuerdas Graves',
    title: 'Bajo Eléctrico',
    desc: 'El pilar armónico y rítmico de cualquier banda. Domina técnicas de dedo, púa, slap, groove y acompañamiento sólido.',
    skills: [
      'Técnicas de pulsación, muting y slap básico/avanzado',
      'Construcción de líneas de bajo y walking bass',
      'Conexión métrica con la batería y el bombo',
      'Armonía aplicada y escalas para bajo'
    ],
    level: 'Principiante a Avanzado',
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&q=80'
  },
  {
    id: 'violin',
    category: 'musica',
    tag: 'Música • Cuerdas Frotadas',
    title: 'Violín y Cuerdas Clásicas',
    desc: 'Formación clásica y popular en violín. Afinación por oído, manejo del arco, postura ergonómica y expresividad melódica.',
    skills: [
      'Colocación del arco y sonoridad limpia',
      'Afinación precisa y entrenamiento auditivo',
      'Lectura a primera vista en clave de Sol',
      'Piezas clásicas, bandas sonoras y música moderna'
    ],
    level: 'Todos los niveles',
    image: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600&q=80'
  },
  {
    id: 'vientos',
    category: 'musica',
    tag: 'Música • Aerófonos',
    title: 'Instrumentos de Viento (Saxo, Clarinete, Flauta)',
    desc: 'Emisión de sonido, respiración circular o diafragmática, digitación y expresión en saxofón, clarinete y flauta traversa.',
    skills: [
      'Embocadura correcta y calidad de timbre',
      'Control de aire y afinación dinámica',
      'Escalas, articulaciones (staccato, legato)',
      'Interpretación solista y música de cámara'
    ],
    level: 'Principiante a Avanzado',
    image: 'https://images.unsplash.com/photo-1525994886773-080587e161c2?w=600&q=80'
  },
  {
    id: 'iniciacion',
    category: 'musica',
    tag: 'Música • 2 a 4 Años',
    title: 'Estimulación Temprana e Iniciación Musical',
    desc: 'Desarrolla la creatividad, el ritmo y el lenguaje en los más pequeños con metodologías pedagógicas vivenciales y lúdicas.',
    skills: [
      'Juegos rítmicos y discriminación auditiva',
      'Canto infantil y coordinación motriz gruesa/fina',
      'Exploración de pequeños instrumentos de percusión',
      'Socialización en un ambiente seguro y enriquecedor'
    ],
    level: 'Primera Infancia (2 a 4 años)',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80'
  },
  {
    id: 'produccion-completa',
    category: 'produccion',
    tag: 'Producción & Audio',
    title: 'Producción Musical & Beatmaking',
    desc: 'Composición musical asistida por computadora. Estructuración de canciones, grabación de instrumentos reales, MIDI y mezcla en DAW.',
    skills: [
      'Manejo experto de Ableton Live, Logic Pro o FL Studio',
      'Grabación de voces e instrumentos acústicos',
      'Edición de audio, afinación (Melodyne/Auto-Tune) y timing',
      'Creación de beats para música urbana, pop o electrónica'
    ],
    level: 'Principiante a Profesional',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80'
  },
  {
    id: 'mezcla-mastering',
    category: 'produccion',
    tag: 'Producción & Audio',
    title: 'Síntesis, Mezcla y Masterización',
    desc: 'Aprende a transformar una pista casera en un producto comercial competitivo que cumpla con los estándares de Spotify y plataformas de streaming.',
    skills: [
      'Ecualización correctiva y tonal en cada pista',
      'Compresión analógica y digital (VCA, Opto, FET)',
      'Procesamiento espacial (Reverbs, Delays, Imagen estéreo)',
      'Masterización para volumen comercial (LUFS, limitadores)'
    ],
    level: 'Intermedio a Avanzado',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80'
  },
  /* DJing oculto temporalmente
  {
    id: 'djing',
    category: 'produccion',
    tag: 'DJ & Performance',
    title: 'Técnicas de DJing Profesional',
    desc: 'Mezcla en vivo con controladoras y mixers Pioneer DJ. Beatmatching por oído, transiciones impecables, lectura de pista y efectos en cabina.',
    skills: [
      'Beatmatching manual y estructura de frases en 4/4',
      'Uso creativo de filtros, hot cues, loops y FX',
      'Organización de biblioteca musical en Rekordbox',
      'Set construction para festivales, clubes y eventos'
    ],
    level: 'Todos los niveles',
    image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=600&q=80'
  },
  */
  {
    id: 'actuacion-teatral',
    category: 'actuacion',
    tag: 'Artes Escénicas',
    title: 'Actuación Teatral y Audiovisual',
    desc: 'Construcción orgánica de personajes, improvisación, memoria emotiva y técnicas específicas para actuar frente a cámaras de cine y TV.',
    skills: [
      'Creación de personajes con verosimilitud',
      'Técnicas de casting y monólogos frente a cámara',
      'Manejo de voz, dicción y resonadores',
      'Montaje de escenas para muestra teatral en vivo'
    ],
    level: 'Todos los niveles',
    image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600&q=80'
  }
  /* Modelaje y Fotografía ocultos temporalmente
  {
    id: 'modelaje-marca',
    category: 'actuacion',
    tag: 'Modelaje & Imagen',
    title: 'Modelaje, Pasarela y Marca Personal',
    desc: 'Postura, elegancia en pasarela, etiqueta, protocolo social y proyección fotográfica para comerciales, sesiones de fotos y redes sociales.',
    skills: [
      'Técnica de pasarela comercial y de alta costura',
      'Posado fotográfico para editoriales y catálogos',
      'Etiqueta, protocolo y oratoria pública',
      'Estrategia de marca personal y presencia visual'
    ],
    level: 'Todos los niveles',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80'
  },
  {
    id: 'fotografia-estudio',
    category: 'fotografia',
    tag: 'Fotografía & Medios',
    title: 'Fotografía Réflex e Iluminación de Estudio',
    desc: 'Domina el triángulo de exposición (ISO, diafragma, velocidad), manejo de flashes externos y esquemas de iluminación profesional.',
    skills: [
      'Manejo 100% manual de cámaras DSLR y Mirrorless',
      'Esquemas de luz: Rembrandt, Split, Butterfly y luces de recorte',
      'Dirección de modelos y fotografía de retrato',
      'Fotografía de producto con cajas de luz y reflectores'
    ],
    level: 'Principiante a Avanzado',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'
  },
  {
    id: 'revelado-lightroom',
    category: 'fotografia',
    tag: 'Fotografía & Edición',
    title: 'Revelado Digital y Retoque (Lightroom & Photoshop)',
    desc: 'Perfecciona tus fotografías digitales. Color grading profesional, curvas de tono, separación de frecuencias en piel y exportación de alta calidad.',
    skills: [
      'Flujo de trabajo y gestión de catálogos en Adobe Lightroom',
      'Corrección de balance de blancos, exposición y curvas',
      'Retoque fino en Photoshop: piel, clonación y máscaras',
      'Creación de presets propios con identidad visual única'
    ],
    level: 'Todos los niveles',
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&q=80'
  }
  */
];

// Preguntas Frecuentes (FAQ)
const FAQ_ITEMS = [
  {
    q: '¿Necesito tener instrumento propio o conocimientos previos para comenzar?',
    a: 'No necesitas conocimientos previos: nuestros programas están diseñados para empezar desde cero absoluto o nivelar tus habilidades si ya tienes experiencia previa. En la escuela contamos con instrumentos de alta gama (pianos, teclados, baterías, guitarras, bajos, sintetizadores y micrófonos) para que practiques en clase desde el primer día.'
  },
  {
    q: '¿Desde qué edad se puede ingresar a la Escuela MPS?',
    a: 'Aceptamos estudiantes desde los 2 años en nuestro programa de Estimulación Temprana e Iniciación Musical. Para instrumentos específicos, producción musical y actuación atendemos a niños desde los 5 años, jóvenes y adultos de cualquier edad sin límite.'
  },
  {
    q: '¿Cómo funcionan los horarios de las clases?',
    a: 'Manejamos horarios altamente flexibles de lunes a sábado, en jornadas matutinas, vespertinas y nocturnas. Al momento de inscribirte coordinamos el día y la hora que mejor se ajuste a tu rutina laboral o académica.'
  },
  {
    q: '¿Las clases son personalizadas o grupales?',
    a: 'Ofrecemos ambas modalidades: clases 1 a 1 (un docente exclusivo para ti) ideales para acelerar tu técnica instrumental o vocal, y talleres grupales / ensambles donde aprendes a tocar en conjunto con otros músicos en un escenario real.'
  },
  {
    q: '¿Los estudiantes tienen oportunidad de presentarse en vivo?',
    a: '¡Sí, es parte esencial de nuestro ADN! En MPS organizamos semestralmente los Recitales MPS en auditorios y escenarios profesionales con sonido e iluminación en vivo, además de muestras teatrales para que vivas la experiencia real de un artista.'
  }
];

export default function CursosPage() {
  const [activeSpotlight, setActiveSpotlight] = useState('musica');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [openFaq, setOpenFaq] = useState(0);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Filtrado de cursos en el Grid Comparativo
  const filteredCourses = selectedCategory === 'todos' 
    ? COURSES_CATALOG 
    : COURSES_CATALOG.filter(c => c.category === selectedCategory);

  const currentSpotlight = SPOTLIGHT_AREAS.find(a => a.id === activeSpotlight) || SPOTLIGHT_AREAS[0];

  const getWhatsAppLink = (message) => {
    return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="cj-page-container">
      {/* Navegación Principal */}
      <HeaderV3 />

      {/* HERO EDITORIAL ESTILO CJ ACADEMY */}
      <section className="cj-hero-section">
        <div className="cj-hero-wrapper">
          <div className="cj-pill-badge">
            <Sparkles size={16} /> Escuela MPS • Academia Integral de Artes
          </div>

          <h1 className="cj-hero-title">
            Educación artística para transformar tu <span className="highlight-gold">talento</span> en excelencia
          </h1>

          <p className="cj-hero-subtitle">
            Aprende música, producción musical y actuación con una metodología práctica desde el primer día, estudios profesionales insonorizados y docentes en activo.
          </p>

          <div className="cj-hero-actions">
            <a href="#catalogo" className="cj-btn-primary">
              Explorar Cursos <ArrowRight size={18} />
            </a>
            <a 
              href={getWhatsAppLink("Hola MPS! Deseo asesoría personalizada sobre los programas académicos.")} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="cj-btn-secondary"
            >
              Hablar con un Asesor
            </a>
          </div>

          {/* BARRA DE ESTADÍSTICAS Y CREDENCIALES */}
          <div className="cj-stats-bar">
            <div className="cj-stat-item">
              <div className="cj-stat-number">+15</div>
              <div className="cj-stat-label">Años de Trayectoria</div>
            </div>
            <div className="cj-stat-item">
              <div className="cj-stat-number">3 Áreas</div>
              <div className="cj-stat-label">Formación Integral</div>
            </div>
            <div className="cj-stat-item">
              <div className="cj-stat-number">100%</div>
              <div className="cj-stat-label">Práctica en Escenario</div>
            </div>
            <div className="cj-stat-item">
              <div className="cj-stat-number">Flexible</div>
              <div className="cj-stat-label">1 a 1 y Ensambles</div>
            </div>
          </div>
        </div>
      </section>

      {/* SPOTLIGHT DE ÁREAS PRINCIPALES */}
      <section className="cj-section" style={{ background: 'var(--panel-bg, rgba(255,255,255,0.01))' }}>
        <div className="cj-section-header">
          <span className="cj-section-tag">Programas Destacados</span>
          <h2 className="cj-section-title">Elige tu disciplina artística</h2>
          <p className="cj-section-desc">
            Cada área cuenta con pensum estructurado por niveles y salas equipadas con tecnología de nivel profesional.
          </p>
        </div>

        {/* SELECTOR TABS DE SPOTLIGHT */}
        <div className="cj-spotlight-nav">
          {SPOTLIGHT_AREAS.map(area => (
            <button
              key={area.id}
              onClick={() => setActiveSpotlight(area.id)}
              className={`cj-spotlight-tab ${activeSpotlight === area.id ? 'active' : ''}`}
            >
              {area.id === 'musica' && '🎵 Área de Música'}
              {area.id === 'produccion' && '🎛️ Producción Musical'}
              {area.id === 'actuacion' && '🎭 Actuación y Teatro'}
            </button>
          ))}
        </div>

        {/* TARJETA SPOTLIGHT EDITORIAL */}
        <div className="cj-spotlight-card">
          <div className="cj-spotlight-info">
            <span className="cj-spotlight-category">{currentSpotlight.tag}</span>
            <h3 className="cj-spotlight-name">{currentSpotlight.name}</h3>
            <p className="cj-spotlight-summary">{currentSpotlight.summary}</p>

            <div className="cj-spotlight-highlights">
              {currentSpotlight.highlights.map((item, idx) => (
                <div key={idx} className="cj-spotlight-highlight-item">
                  <div className="cj-spotlight-icon-bullet">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href={getWhatsAppLink(currentSpotlight.linkMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="cj-btn-primary"
              >
                Inscribirme o Solicitar Info <ArrowRight size={18} />
              </a>
              <button 
                onClick={() => setIsContactOpen(true)}
                className="cj-btn-secondary"
                style={{ cursor: 'pointer' }}
              >
                Agendar Visita
              </button>
            </div>
          </div>

          <div className="cj-spotlight-visual">
            <img src={currentSpotlight.image} alt={currentSpotlight.name} />
            <div className="cj-spotlight-visual-overlay"></div>
            <div className="cj-spotlight-badge">
              <div className="cj-spotlight-badge-title">Modalidad</div>
              <div className="cj-spotlight-badge-value">{currentSpotlight.mode}</div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID COMPARATIVO Y CATÁLOGO DETALLADO */}
      <section id="catalogo" className="cj-section">
        <div className="cj-section-header">
          <span className="cj-section-tag">Explora la Oferta Académica</span>
          <h2 className="cj-section-title">Todos los Cursos Disponibles</h2>
          <p className="cj-section-desc">
            Filtra por disciplina y encuentra la formación específica que estás buscando.
          </p>
        </div>

        {/* BOTONES DE FILTRO */}
        <div className="cj-filter-bar">
          <button 
            className={`cj-filter-btn ${selectedCategory === 'todos' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('todos')}
          >
            Todos ({COURSES_CATALOG.length})
          </button>
          <button 
            className={`cj-filter-btn ${selectedCategory === 'musica' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('musica')}
          >
            Música ({COURSES_CATALOG.filter(c => c.category === 'musica').length})
          </button>
          <button 
            className={`cj-filter-btn ${selectedCategory === 'produccion' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('produccion')}
          >
            Producción Musical ({COURSES_CATALOG.filter(c => c.category === 'produccion').length})
          </button>
          <button 
            className={`cj-filter-btn ${selectedCategory === 'actuacion' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('actuacion')}
          >
            Actuación ({COURSES_CATALOG.filter(c => c.category === 'actuacion').length})
          </button>
          {/* Fotografía oculto temporalmente
          <button 
            className={`cj-filter-btn ${selectedCategory === 'fotografia' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('fotografia')}
          >
            Fotografía ({COURSES_CATALOG.filter(c => c.category === 'fotografia').length})
          </button>
          */}
        </div>

        {/* GRID DE TARJETAS */}
        <div className="cj-courses-grid">
          {filteredCourses.map(course => (
            <div key={course.id} className="cj-course-card">
              <div className="cj-course-thumb">
                <img src={course.image} alt={course.title} />
                <span className="cj-course-badge-tag">{course.tag}</span>
              </div>

              <div className="cj-course-body">
                <h3 className="cj-course-title">{course.title}</h3>
                <p className="cj-course-desc">{course.desc}</p>

                <ul className="cj-course-skills">
                  {course.skills.map((skill, sIdx) => (
                    <li key={sIdx}>
                      <span style={{ color: 'var(--accent, #00DE85)' }}>•</span> {skill}
                    </li>
                  ))}
                </ul>

                <div className="cj-course-footer">
                  <span className="cj-course-mode">{course.level}</span>
                  <a
                    href={getWhatsAppLink(`Hola MPS! Deseo consultar horarios y cupos para el curso de: ${course.title}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cj-course-link-btn"
                  >
                    Inscribirme <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* METODOLOGÍA: NIVELES DE FORMACIÓN PROGRESSIVA */}
      <section className="cj-section" style={{ background: 'var(--section-bg, rgba(0,0,0,0.2))' }}>
        <div className="cj-section-header">
          <span className="cj-section-tag">Ruta de Aprendizaje</span>
          <h2 className="cj-section-title">Estructura de Formación Progresiva</h2>
          <p className="cj-section-desc">
            Avanza paso a paso desde los conceptos fundamentales hasta la maestría y la experiencia real en escenario.
          </p>
        </div>

        <div className="cj-levels-grid">
          <div className="cj-level-card">
            <div className="cj-level-num">01</div>
            <div className="cj-level-subtitle">Fundamentos & Exploración</div>
            <h3 className="cj-level-title">Descubre y Conecta</h3>
            <p className="cj-level-desc">
              Desarrolla el oído, la postura, la respiración y la lectura musical o visual. Aprende la técnica base de forma intuitiva, divertida y sin frustración, adaptada a tu ritmo personal.
            </p>
          </div>

          <div className="cj-level-card" style={{ borderColor: 'rgba(0, 222, 133, 0.35)', background: 'rgba(3, 34, 33, 0.3)' }}>
            <div className="cj-level-num" style={{ color: 'rgba(0, 222, 133, 0.2)' }}>02</div>
            <div className="cj-level-subtitle">Desarrollo & Ensamble</div>
            <h3 className="cj-level-title">Técnica y Trabajo en Equipo</h3>
            <p className="cj-level-desc">
              Profundiza en repertorio de mayor complejidad, armonía moderna, improvisación y dinámicas de grupo. Participa en ensambles con otros músicos en salas insonorizadas y equipadas.
            </p>
          </div>

          <div className="cj-level-card">
            <div className="cj-level-num">03</div>
            <div className="cj-level-subtitle">Concierto & Producción</div>
            <h3 className="cj-level-title">Escenario Real y Estudio</h3>
            <p className="cj-level-desc">
              Vive la experiencia de tocar en vivo en los Recitales Semestrales MPS, graba tus temas en nuestro estudio profesional de audio y produce material artístico de nivel comercial.
            </p>
          </div>
        </div>
      </section>

      {/* AUTORIDAD & FACULTAD DOCENTE */}
      <section className="cj-section">
        <div className="cj-authority-box">
          <div>
            <span className="cj-section-tag">Respaldo Institucional</span>
            <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.6rem)', fontWeight: 800, marginBottom: '1.2rem', lineHeight: 1.2 }}>
              Aprende con artistas y educadores en activo
            </h2>
            <p style={{ color: 'var(--text-secondary, rgba(255, 255, 255, 0.75))', lineHeight: 1.7, marginBottom: '2rem' }}>
              En Music and Production School contamos con un equipo docente altamente calificado, graduado de las principales facultades de música y artes, y con trayectoria en escenarios, grabaciones y producciones reales.
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 222, 133, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #00DE85)' }}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Metodología MPS Comprobada</div>
                <div style={{ color: 'var(--text-secondary, rgba(255, 255, 255, 0.6))', fontSize: '0.88rem' }}>Más de una década formando músicos en Medellín</div>
              </div>
            </div>
          </div>

          <div className="cj-authority-pillars">
            <div className="cj-pillar-item">
              <Award size={24} color="var(--accent, #00DE85)" style={{ marginBottom: '0.8rem' }} />
              <div className="cj-pillar-title">Docentes Certificados</div>
              <div className="cj-pillar-desc">Músicos, ingenieros y pedagogos apasionados por la enseñanza personalizada.</div>
            </div>

            <div className="cj-pillar-item">
              <Headphones size={24} color="var(--accent, #00DE85)" style={{ marginBottom: '0.8rem' }} />
              <div className="cj-pillar-title">Estudios Insonorizados</div>
              <div className="cj-pillar-desc">Salas acústicamente tratadas con instrumentos y equipos profesionales.</div>
            </div>

            <div className="cj-pillar-item">
              <Users size={24} color="var(--accent, #00DE85)" style={{ marginBottom: '0.8rem' }} />
              <div className="cj-pillar-title">Comunidad Artística</div>
              <div className="cj-pillar-desc">Ambiente colaborativo donde crearás conexiones duraderas con otros artistas.</div>
            </div>

            <div className="cj-pillar-item">
              <CalendarCheck size={24} color="var(--accent, #00DE85)" style={{ marginBottom: '0.8rem' }} />
              <div className="cj-pillar-title">Horarios Flexibles</div>
              <div className="cj-pillar-desc">Jornadas mañana, tarde y noche adaptadas a tu trabajo o estudio.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ACORDEÓN INTERACTIVO */}
      <section className="cj-section" style={{ background: 'var(--panel-bg, rgba(255,255,255,0.01))' }}>
        <div className="cj-section-header">
          <span className="cj-section-tag">Resolviendo Dudas</span>
          <h2 className="cj-section-title">Preguntas Frecuentes</h2>
          <p className="cj-section-desc">
            Todo lo que necesitas saber antes de dar el primer paso en tu formación artística.
          </p>
        </div>

        <div className="cj-faq-container">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="cj-faq-item">
                <button
                  className="cj-faq-question"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp size={22} color="var(--accent, #00DE85)" />
                  ) : (
                    <ChevronDown size={22} color="var(--text-secondary, #aaa)" />
                  )}
                </button>
                {isOpen && (
                  <div className="cj-faq-answer">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* BANNER FINAL CTA */}
      <section className="cj-final-cta">
        <div className="cj-cta-box">
          <h2 className="cj-cta-box-title">
            Tu camino artístico <span className="highlight-gold">comienza hoy</span>
          </h2>
          <p className="cj-cta-box-desc">
            Ven a conocer nuestras instalaciones, prueba nuestros instrumentos y conversa con nuestros profesores. Agenda una clase de asesoría sin costo de matrícula inicial.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
            <a
              href={getWhatsAppLink("Hola MPS! Quiero agendar una clase de prueba y conocer la escuela.")}
              target="_blank"
              rel="noopener noreferrer"
              className="cj-btn-primary"
              style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem' }}
            >
              Agendar Clase de Prueba por WhatsApp <ArrowRight size={20} />
            </a>
            <button
              onClick={() => setIsContactOpen(true)}
              className="cj-btn-secondary"
              style={{ padding: '1.1rem 2rem', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              Solicitar Llamada
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER GENERAL */}
      <FooterV3 />

      {/* MODAL DE CONTACTO */}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
