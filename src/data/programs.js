// Catálogo Oficial de Programas y Oferta Académica Escuela MPS

export const KIT_PRICE = 35000;

export const formatCOP = (val) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val || 0);
};

// Tarifas Oficiales Base de Escuela MPS (extraídas de la documentación y flyers institucionales)
export const OFFICIAL_TARIFAS_DEFAULT = {
  // Clases Individuales Presenciales en Sede
  'individual_sede_4': {
    id: 'individual_sede_4',
    name: '4 Clases Presenciales en Sede',
    tipo: 'individual',
    modalidad: 'sede',
    clases: 4,
    precio: 280000,
    descripcion: 'Clases personalizadas según tu nivel y objetivo en instalaciones MPS.'
  },
  'individual_sede_8': {
    id: 'individual_sede_8',
    name: '8 Clases Presenciales en Sede',
    tipo: 'individual',
    modalidad: 'sede',
    clases: 8,
    precio: 520000,
    descripcion: 'Paquete de 8 clases individuales presenciales con horario flexible.'
  },
  'individual_sede_12': {
    id: 'individual_sede_12',
    name: '12 Clases Presenciales en Sede',
    tipo: 'individual',
    modalidad: 'sede',
    clases: 12,
    precio: 720000,
    descripcion: 'Paquete trimestral de 12 clases individuales presenciales.'
  },
  // Clases Individuales a Domicilio
  'individual_domicilio_4': {
    id: 'individual_domicilio_4',
    name: '4 Clases Individuales a Domicilio',
    tipo: 'individual',
    modalidad: 'domicilio',
    clases: 4,
    precio: 305000,
    descripcion: 'Clases personalizadas en tu residencia con docente asignado MPS.'
  },
  'individual_domicilio_8': {
    id: 'individual_domicilio_8',
    name: '8 Clases Individuales a Domicilio',
    tipo: 'individual',
    modalidad: 'domicilio',
    clases: 8,
    precio: 590000,
    descripcion: 'Paquete de 8 clases individuales a domicilio con docente asignado MPS.'
  },
  'individual_domicilio_12': {
    id: 'individual_domicilio_12',
    name: '12 Clases Individuales a Domicilio',
    tipo: 'individual',
    modalidad: 'domicilio',
    clases: 12,
    precio: 830000,
    descripcion: 'Paquete trimestral de 12 clases individuales a domicilio.'
  },
  // Clases Semipersonalizadas Grupales
  'grupal_semipersonalizado_mes': {
    id: 'grupal_semipersonalizado_mes',
    name: 'Clases Semipersonalizadas Grupales (Mensual)',
    tipo: 'grupal',
    modalidad: 'sede',
    clases: 4,
    duracionHoras: 1.5,
    precio: 180000,
    descripcion: '1 hora y media a la semana en grupo reducido, Google Classroom y proceso trimestral con concierto de cierre.'
  },
  'grupal_semipersonalizado_trimestre': {
    id: 'grupal_semipersonalizado_trimestre',
    name: 'Clases Semipersonalizadas Grupales (Trimestre Completo)',
    tipo: 'grupal',
    modalidad: 'sede',
    clases: 12,
    duracionHoras: 1.5,
    precio: 540000,
    descripcion: 'Ciclo trimestral completo con acompañamiento en Google Classroom y concierto de cierre.'
  }
};

export const OFFICIAL_PROGRAMS = {
  'mps-stage': {
    id: 'mps-stage',
    title: 'MPS STAGE (Instrumento + Ensamble)',
    category: 'Programa de Formación Musical • Semestral',
    badge: 'PROGRAMA DE FORMACIÓN MUSICAL',
    tagline: 'Aprende tu instrumento. Toca con otros. Sube al Stage.',
    description: 'Programa que combina el desarrollo personalizado del instrumento con la experiencia real de tocar en un ensamble. El estudiante no solo aprende a interpretar su instrumento de forma individual, sino también a escuchar, acompañar, comunicarse y construir música con otros dentro de una banda.',
    duration: '16 Semanas por semestre • 3 horas semanales • 48 Horas en total',
    presentation: 'Presentación final y concierto en vivo al cierre de semestre según programación institucional.',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80',
    linkPrice: 180000,
    onePrice: 280000,
    homePrice: 305000,
    components: [
      { name: 'Instrumento Personalizado', hours: '1 h/semana', format: 'Clase individual (1 estudiante) • Técnica, lenguaje musical y repertorio' },
      { name: 'Ensamble Musical Grupal', hours: '2 h/semana', format: 'Trabajo colectivo (3 a 8 estudiantes) • Pulso, escucha activa, roles y montaje en vivo' }
    ],
    develops: [
      'Técnica instrumental: postura, digitación, coordinación, afinación y sonoridad',
      'Lenguaje musical: lectura rítmico-melódica, escalas, acordes y estructura',
      'Interpretación: dinámicas, fraseo, expresión, estilo e improvisación',
      'Ensamble: pulso colectivo, escucha activa y respuesta musical en grupo',
      'Roles en arreglo: comprensión de la función de cada instrumento en la banda',
      'Experiencia escénica: montaje de repertorio y presentación oficial en vivo'
    ]
  },
  'curso-libre': {
    id: 'curso-libre',
    title: 'Curso Libre de Instrumento',
    category: 'Formación Instrumental Continua',
    badge: 'CURSO LIBRE OFICIAL MPS',
    tagline: 'Tu instrumento. Tu proceso. Tu música.',
    description: 'Línea de formación musical orientada al desarrollo técnico, musical e interpretativo del estudiante a través del aprendizaje de un instrumento o de la técnica vocal. El proceso se organiza mediante una Ruta de Aprendizaje Personalizada (RAP) adaptada a tus metas, edad y ritmo.',
    duration: 'Ciclo Trimestral Renovable • 2 a 4 alumnos (Link), 1 a 1 (One) o Domicilio (Home)',
    presentation: 'Recital semestral en auditorio oficial MPS con sonido e iluminación profesional.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    linkPrice: 180000,
    onePrice: 280000,
    homePrice: 305000,
    components: [
      { name: 'Modalidad MPS LINK (Semipersonalizado)', hours: '1.5 h/semana', format: 'Grupo reducido en sede • Proceso trimestral • Concierto de cierre' },
      { name: 'Modalidad MPS ONE (Personalizado 1 a 1)', hours: '1 h/semana', format: '1 estudiante individual en sede • Paquetes de 4, 8 o 12 clases' },
      { name: 'Modalidad MPS HOME (A Domicilio)', hours: '1 h/semana', format: 'Clase en tu residencia con docente asignado MPS • Paquetes de 4, 8 o 12 clases' }
    ],
    develops: [
      'Postura, digitación, técnica y coordinación motriz en el instrumento',
      'Lectura musical, ritmo y aplicación práctica de conceptos teóricos',
      'Habilidades auditivas, afinación y escucha consciente',
      'Selección y montaje progresivo de repertorio a tu gusto',
      'Expresión musical, estilo e improvisación según tu nivel',
      'Hábitos de estudio, práctica constante y autonomía progresiva'
    ]
  },
  'mps-producer': {
    id: 'mps-producer',
    title: 'MPS PRODUCER (Producción de Audio)',
    category: 'Programa Especializado • Tecnología Sonora',
    badge: 'PROGRAMA ESPECIALIZADO DE AUDIO',
    tagline: 'De tus ideas a canciones reales.',
    description: 'Programa especializado para desarrollar las competencias necesarias para crear, grabar, editar, mezclar, masterizar y gestionar proyectos musicales desde una perspectiva técnica, creativa y profesional. Combina teoría grupal, práctica individual y sesiones en estudios de grabación comerciales aliados.',
    duration: '1 Año académico (2 semestres de 16 semanas) • 2 h/semana • Máx 6 alumnos',
    presentation: 'Semestre 1: Demo básico | Semestre 2: Proyecto final terminado + muestra pública.',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80',
    linkPrice: 180000,
    onePrice: 280000,
    homePrice: 305000,
    components: [
      { name: 'Módulo 1: Gestión de Proyectos', hours: 'Teoría/DAW', format: 'Objetivos creativos y comerciales, flujo de trabajo, propiedad intelectual y distribución' },
      { name: 'Módulo 2: Fundamentos de Audio', hours: 'Teoría/DAW', format: 'DAW, señal, grabación, microfonía, latencia, acústica y procesadores' },
      { name: 'Módulo 3: Procesos de Audio', hours: 'Práctica', format: 'Edición, MIDI, mezcla, máster y entregables para plataformas digitales' },
      { name: 'Módulo 4: Audición Crítica', hours: 'Análisis', format: 'Análisis técnico y estético de referentes y lenguajes de producción' }
    ],
    develops: [
      'Configuración y ruteo profesional de audio e interfaces en DAW',
      'Microfonía, técnicas de captura estéreo y aislamiento sonoro',
      'Edición rítmica, afinación vocal y diseño sonoro MIDI',
      'Técnicas de mezcla moderna: EQ paramétrica, compresión y espacialidad',
      'Masterización competitiva para streaming (Spotify, Apple Music)',
      'Gestión de derechos de autor y distribución comercial'
    ]
  },
  'mps-pre-universitario': {
    id: 'mps-pre-universitario',
    title: 'PRE-UNIVERSITARIO MUSICAL',
    category: 'Formación Intensiva de Admisión Superior',
    badge: 'PREPARACIÓN UNIVERSITARIA INTENSIVA',
    tagline: 'Prepara tu música. Profundiza tu lenguaje. Da el siguiente paso.',
    description: 'Proceso intensivo de formación de alto rendimiento que integra instrumento principal, teclado complementario, ensamble colectivo, gramática musical y teoría armónica, para construir una base sólida y asegurar el ingreso a facultades de música a nivel superior.',
    duration: '1 Semestre académico (16 semanas) • 15 h/semana • 240 Horas estimadas',
    presentation: 'Audición de simulacro y preparación intensiva de pruebas de admisión universitaria.',
    image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&q=80',
    linkPrice: 180000,
    onePrice: 280000,
    homePrice: 305000,
    components: [
      { name: 'Instrumento Principal', hours: '1 h/semana', format: 'Desarrollo técnico, repertorio avanzado e interpretación' },
      { name: 'Teclado Complementario', hours: '2 h/semana', format: 'Aplicación musical desde el teclado y armonía funcional' },
      { name: 'Ensamble Colectivo', hours: '2 h/semana', format: 'Interpretación en grupo y desarrollo de la escucha activa' },
      { name: 'Gramática y Audio', hours: '6 h/semana', format: 'Lectura rítmico-melódica, claves, intervalos y entrenamiento auditivo' },
      { name: 'Teoría Musical y Armonía', hours: '4 h/semana', format: 'Fundamentos armónicos, enlaces de acordes y análisis formal' }
    ],
    develops: [
      'Lectura a primera vista fluida en claves de Sol, Fa y Do',
      'Entrenamiento auditivo: reconocimiento de intervalos, tríadas y tétradas',
      'Dictado rítmico, melódico y armónico intensivo',
      'Técnica avanzada y montaje de obras exigidas para audición',
      'Simulacros reales de exámenes de admisión universitaria',
      'Metodología de estudio intensivo avalada por docentes graduados'
    ]
  },
  'mps-music-camp': {
    id: 'mps-music-camp',
    title: 'MPS MUSIC CAMP (Temporada Intensiva)',
    category: 'Temporada Vacacional • Niños y Jóvenes',
    badge: 'TEMPORADA VACACIONAL INTENSIVA',
    tagline: 'Aprender, crear, ensayar, presentar.',
    description: 'Dos semanas para aprender, crear, ensayar y vivir la música en un entorno dinámico, colectivo y profesional. Combina el aprendizaje instrumental, el ensamble de banda y el taller corporal y de performance escénico.',
    duration: '2 Semanas (10 días Lunes a Viernes) • 2 h/día • 20 Horas en total',
    presentation: 'Muestra escénica final en auditorio ante familiares e invitados.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    linkPrice: 180000,
    onePrice: 280000,
    homePrice: 305000,
    components: [
      { name: 'Instrumento Semipersonalizado', hours: '8 Horas (Total)', format: 'Técnica, postura, ejercicios y montaje por instrumento' },
      { name: 'Ensamble Musical en Vivo', hours: '8 Horas (Total)', format: 'Pulso, escucha, interacción y dinámica de banda' },
      { name: 'Taller Corporal y Performance', hours: '4 Horas (Total)', format: 'Expresión corporal, soltura escénica y desinhibición' }
    ],
    develops: [
      'Fortalecimiento rápido de habilidades técnicas en el instrumento',
      'Experiencia real de tocar en una banda con otros músicos',
      'Desarrollo de presencia escénica y manejo corporal en tarima',
      'Mejora de la escucha, coordinación y ritmo grupal',
      'Montaje acelerado de canciones para presentación final',
      'Convivencia artística y trabajo cooperativo en equipo'
    ]
  },
  matricula: {
    id: 'matricula',
    title: 'Matrícula Anual Institucional',
    category: 'Registro Oficial MPS',
    badge: 'REGISTRO INSTITUCIONAL',
    tagline: 'Tu carné, reserva de salas y beneficios exclusivos de estudiante.',
    description: 'Habilita tu condición de estudiante activo en la Escuela MPS, tu código de matrícula, reservas de salas de ensayo y convenios institucionales.',
    duration: 'Vigencia Anual (12 Meses)',
    presentation: 'Carné institucional oficial con beneficios Yamaha y aliados.',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80',
    linkPrice: 50000,
    onePrice: 50000,
    homePrice: 50000,
    components: [
      { name: 'Carné Institucional', hours: 'Oficial', format: 'Código de estudiante y convenios comerciales' },
      { name: 'Reserva de Salas de Ensayo', hours: 'Ilimitada', format: 'Acceso a salas insonorizadas y equipadas' }
    ],
    develops: [
      'Acceso a la plataforma y reservas de espacios de ensayo',
      'Descuentos en masterclasses y clínicas especiales',
      'Participación en festivales y eventos institucionales'
    ]
  }
};

export const INSTRUMENTS_LIST = [
  { id: 'canto', name: 'Técnica Vocal y Canto' },
  { id: 'piano', name: 'Piano y Teclados' },
  { id: 'guitarra', name: 'Guitarra (Acústica y Eléctrica)' },
  { id: 'violin', name: 'Violín y Cuerdas Clásicas' },
  { id: 'bateria', name: 'Batería y Percusión' },
  { id: 'bajo', name: 'Bajo Eléctrico' },
  { id: 'actuacion', name: 'Actuación y Expresión Escénica' }
];

export const GROUP_SCHEDULES = {
  canto: [
    { id: 'canto-mie-4-6', label: 'Miércoles 4:00 pm - 6:00 pm (Técnica Vocal)' },
    { id: 'canto-mie-6-8', label: 'Miércoles 6:00 pm - 8:00 pm (Técnica Vocal)' },
    { id: 'canto-mie-7-9', label: 'Miércoles 7:00 pm - 9:00 pm (Canto Nocturno)' },
    { id: 'canto-jue-7-9', label: 'Jueves 7:00 pm - 9:00 pm (Canto Nocturno)' },
    { id: 'canto-sab-11-1', label: 'Sábado 11:00 am - 1:00 pm (Canto Grupal)' },
    { id: 'canto-sab-1-3', label: 'Sábado 1:00 pm - 3:00 pm (Técnica Vocal y Ensamble)' },
    { id: 'canto-sab-3-5', label: 'Sábado 3:00 pm - 5:00 pm (Técnica Vocal)' }
  ],
  piano: [
    { id: 'piano-mar-5-7', label: 'Martes 5:00 pm - 7:00 pm (Piano Grupal)' },
    { id: 'piano-jue-4-6', label: 'Jueves 4:00 pm - 6:00 pm (Piano y Lenguaje)' },
    { id: 'piano-sab-9-11', label: 'Sábado 9:00 am - 11:00 am (Piano Básico)' },
    { id: 'piano-sab-11-1', label: 'Sábado 11:00 am - 1:00 pm (Teclados y Ensamble)' },
    { id: 'piano-sab-2-4', label: 'Sábado 2:00 pm - 4:00 pm (Piano Clásico y Moderno)' }
  ],
  guitarra: [
    { id: 'guitarra-lun-4-6', label: 'Lunes 4:00 pm - 6:00 pm (Guitarra Acústica)' },
    { id: 'guitarra-mie-5-7', label: 'Miércoles 5:00 pm - 7:00 pm (Guitarra Eléctrica)' },
    { id: 'guitarra-vie-4-6', label: 'Viernes 4:00 pm - 6:00 pm (Guitarra y Repertorio)' },
    { id: 'guitarra-sab-9-11', label: 'Sábado 9:00 am - 11:00 am (Guitarra Iniciación)' },
    { id: 'guitarra-sab-11-1', label: 'Sábado 11:00 am - 1:00 pm (Guitarra y Ensamble)' },
    { id: 'guitarra-sab-2-4', label: 'Sábado 2:00 pm - 4:00 pm (Guitarra Avanzada)' }
  ],
  violin: [
    { id: 'violin-vie-4-530', label: 'Viernes 4:00 pm - 5:30 pm (Cuerdas Frotadas Semipersonalizado)' },
    { id: 'violin-sab-10-1130', label: 'Sábado 10:00 am - 11:30 am (Cuerdas Frotadas Semipersonalizado)' },
    { id: 'violin-lun-4-6', label: 'Lunes 4:00 pm - 6:00 pm (Violín Método Suzuki / Tradicional)' },
    { id: 'violin-mie-4-6', label: 'Miércoles 4:00 pm - 6:00 pm (Cuerdas Frotadas)' },
    { id: 'violin-sab-10-12', label: 'Sábado 10:00 am - 12:00 m (Violín Ensamble)' }
  ],
  bateria: [
    { id: 'bateria-mar-4-6', label: 'Martes 4:00 pm - 6:00 pm (Batería y Ritmos)' },
    { id: 'bateria-jue-5-7', label: 'Jueves 5:00 pm - 7:00 pm (Percusión y Groove)' },
    { id: 'bateria-sab-1-3', label: 'Sábado 1:00 pm - 3:00 pm (Batería en Banda)' }
  ],
  bajo: [
    { id: 'bajo-lun-5-7', label: 'Lunes 5:00 pm - 7:00 pm (Bajo Eléctrico)' },
    { id: 'bajo-jue-6-8', label: 'Jueves 6:00 pm - 8:00 pm (Armonía y Bajo)' },
    { id: 'bajo-sab-3-5', label: 'Sábado 3:00 pm - 5:00 pm (Líneas de Bajo y Ensamble)' }
  ],
  actuacion: [
    { id: 'actuacion-mar-6-8', label: 'Martes 6:00 pm - 8:00 pm (Expresión Escénica)' },
    { id: 'actuacion-sab-2-4', label: 'Sábado 2:00 pm - 4:00 pm (Taller Corporal y Voz)' }
  ]
};
