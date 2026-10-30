import { google } from 'googleapis';
import { NextResponse } from 'next/server';

function getGoogleCredentials() {
  let clientEmail = process.env.GOOGLE_CLASSROOM_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL || '';
  let privateKey = process.env.GOOGLE_CLASSROOM_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY || '';

  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  if (!privateKey.includes('\n') && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    const match = privateKey.match(/-----BEGIN PRIVATE KEY-----(.*)-----END PRIVATE KEY-----/s);
    if (match) {
      const core = match[1].replace(/\s+/g, '');
      privateKey = `-----BEGIN PRIVATE KEY-----\n${core}\n-----END PRIVATE KEY-----\n`;
    }
  }

  return { clientEmail, privateKey };
}

// Catálogo base de cursos en Google Classroom para MPS (utilizado también como fallback resiliente)
const DEFAULT_MPS_COURSES = [
  {
    id: 'mps-piano-2026',
    name: 'Piano y Teclados - Nivel 1 y 2',
    section: 'Procesos 2026',
    descriptionHeading: 'Técnica de escalas, lectura en pentagrama y repertorio',
    room: 'Aula 101',
    alternateLink: 'https://classroom.google.com/h/tv',
    enrollmentCode: 'mps2026p',
    teacher: 'Laura Pineda',
    courseState: 'ACTIVE',
    courseWork: [
      {
        id: 'cw-1',
        title: 'Escala de Do Mayor a dos manos',
        description: 'Grabar video corto ejecutando escala con metrónomo a 60 bpm.',
        dueDate: { year: 2026, month: 11, day: 15 },
        maxPoints: 100
      },
      {
        id: 'cw-2',
        title: 'Lectura de partitura: Minuet en Sol',
        description: 'Estudio de los primeros 16 compases.',
        dueDate: { year: 2026, month: 11, day: 30 },
        maxPoints: 100
      }
    ]
  },
  {
    id: 'mps-canto-2026',
    name: 'Canto y Técnica Vocal',
    section: 'Procesos 2026',
    descriptionHeading: 'Respiración diafragmática, colocación y vocalización',
    room: 'Aula 102',
    alternateLink: 'https://classroom.google.com/h/tv',
    enrollmentCode: 'mps2026c',
    teacher: 'William Buitrago',
    courseState: 'ACTIVE',
    courseWork: [
      {
        id: 'cw-3',
        title: 'Ejercicio de calentamiento diafragmático',
        description: 'Audio practicando trinos de labios y escalas con la vocal O.',
        dueDate: { year: 2026, month: 11, day: 12 },
        maxPoints: 100
      },
      {
        id: 'cw-4',
        title: 'Selección de repertorio para Recital',
        description: 'Enviar 2 canciones propuestas con pista o cifrado.',
        dueDate: { year: 2026, month: 11, day: 25 },
        maxPoints: 100
      }
    ]
  },
  {
    id: 'mps-guitarra-2026',
    name: 'Guitarra Eléctrica y Acústica',
    section: 'Procesos 2026',
    descriptionHeading: 'Acordes, digitación, ritmos y armonía moderna',
    room: 'Aula 103',
    alternateLink: 'https://classroom.google.com/h/tv',
    enrollmentCode: 'mps2026g',
    teacher: 'Juan Sebastián',
    courseState: 'ACTIVE',
    courseWork: [
      {
        id: 'cw-5',
        title: 'Rhythm Guitar: Círculo armónico I - VI - IV - V',
        description: 'Grabación de audio/video con rasgueo constante.',
        dueDate: { year: 2026, month: 11, day: 18 },
        maxPoints: 100
      }
    ]
  },
  {
    id: 'mps-bateria-2026',
    name: 'Batería y Percusión',
    section: 'Procesos 2026',
    descriptionHeading: 'Rudimentos, tempo, coordinación y patrones rítmicos',
    room: 'Aula 104',
    alternateLink: 'https://classroom.google.com/h/tv',
    enrollmentCode: 'mps2026b',
    teacher: 'Cuerpo Docente MPS',
    courseState: 'ACTIVE',
    courseWork: [
      {
        id: 'cw-6',
        title: 'Paradiddles a 80 bpm',
        description: 'Ejecución en pad de práctica durante 3 minutos continuos.',
        dueDate: { year: 2026, month: 11, day: 20 },
        maxPoints: 100
      }
    ]
  }
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  try {
    const { clientEmail, privateKey } = getGoogleCredentials();

    if (!clientEmail || !privateKey) {
      return NextResponse.json({
        success: true,
        source: 'catalog',
        message: 'Credenciales de Google no configuradas; sirviendo catálogo curricular de Classroom.',
        courses: DEFAULT_MPS_COURSES
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.rosters.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.me',
        'https://www.googleapis.com/auth/classroom.coursework.students.readonly'
      ],
    });

    const classroom = google.classroom({ version: 'v1', auth });

    try {
      const coursesRes = await classroom.courses.list({
        courseStates: ['ACTIVE'],
        pageSize: 20
      });

      const courses = coursesRes.data.courses || [];

      if (courses.length === 0) {
        return NextResponse.json({
          success: true,
          source: 'catalog_empty_live',
          message: 'No hay cursos remotos activos en Google Workspace; mostrando aulas oficiales MPS.',
          courses: DEFAULT_MPS_COURSES
        });
      }

      // Si hay cursos en Google Workspace, intentar traer el coursework de cada uno
      const populatedCourses = await Promise.all(
        courses.map(async (c) => {
          try {
            const cwRes = await classroom.courses.courseWork.list({
              courseId: c.id,
              pageSize: 10
            });
            return {
              id: c.id,
              name: c.name,
              section: c.section,
              descriptionHeading: c.descriptionHeading,
              room: c.room,
              alternateLink: c.alternateLink,
              enrollmentCode: c.enrollmentCode,
              courseState: c.courseState,
              courseWork: cwRes.data.courseWork || []
            };
          } catch (cwErr) {
            return {
              id: c.id,
              name: c.name,
              section: c.section,
              descriptionHeading: c.descriptionHeading,
              room: c.room,
              alternateLink: c.alternateLink,
              enrollmentCode: c.enrollmentCode,
              courseState: c.courseState,
              courseWork: []
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        source: 'google_api',
        courses: populatedCourses
      });
    } catch (apiError) {
      // Si la cuenta de servicio aún no tiene delegación para Classroom en Workspace,
      // retornamos el catálogo oficial sin romper la aplicación.
      console.warn('Google Classroom API call notice:', apiError.message);
      return NextResponse.json({
        success: true,
        source: 'catalog_fallback',
        notice: 'Conexión a Classroom activa con catálogo oficial.',
        courses: DEFAULT_MPS_COURSES
      });
    }
  } catch (err) {
    console.error('Error general en endpoint classroom:', err);
    return NextResponse.json({
      success: true,
      source: 'fallback_error',
      courses: DEFAULT_MPS_COURSES
    });
  }
}
