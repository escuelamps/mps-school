import './globals.css';
import FirebaseAnalytics from '@/components/FirebaseAnalytics';
import ThemeToggle from '@/components/ThemeToggle';
import CookieBanner from '@/components/CookieBanner';
import SessionTimeout from '@/components/SessionTimeout';

export const metadata = {
  metadataBase: new URL('https://escuelamps.com'),
  title: {
    default: 'Escuela MPS | Academia de Música, Producción y Actuación en Bogotá',
    template: '%s | Escuela MPS',
  },
  description:
    'Academia integral de música, producción y actuación en Bogotá. Clases personalizadas (1 a 1) y grupales de canto, piano, guitarra, batería y audio. Agenda tu diagnóstico artístico RAP.',
  keywords: [
    'clases de musica bogota',
    'escuela de musica bogota',
    'clases de canto bogota',
    'cursos de piano bogota',
    'clases de guitarra bogota',
    'academia de musica bogota',
    'cursos de bateria bogota',
    'produccion musical bogota',
    'taller de actuacion bogota',
    'tecnica vocal bogota',
    'escuela de artes bogota',
    'clases de musica personalizadas',
  ],
  authors: [{ name: 'Escuela MPS', url: 'https://escuelamps.com' }],
  creator: 'Escuela MPS',
  publisher: 'Escuela MPS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://escuelamps.com',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://escuelamps.com',
    siteName: 'Escuela MPS',
    title: 'Escuela MPS | Academia de Música, Producción y Actuación en Bogotá',
    description:
      'Transforma tu talento musical con clases personalizadas y ensambles en vivo en Bogotá. Agenda tu evaluación diagnóstica de nivelación.',
    images: [
      {
        url: '/images/music_studio_mockup_1783393563250.jpg',
        width: 1200,
        height: 630,
        alt: 'Escuela MPS - Estudios y Clases de Música en Bogotá',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Escuela MPS | Academia de Música, Producción y Actuación en Bogotá',
    description:
      'Transforma tu talento musical con clases personalizadas y ensambles en vivo en Bogotá.',
    images: ['/images/music_studio_mockup_1783393563250.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'CO-DC',
    'geo.placename': 'Bogotá',
    'geo.position': '4.60971;-74.08175',
    ICBM: '4.60971, -74.08175',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['EducationalOrganization', 'MusicSchool', 'LocalBusiness'],
      '@id': 'https://escuelamps.com/#organization',
      name: 'Escuela MPS - Music and Production School',
      alternateName: 'MPS Escuela de Música y Artes',
      url: 'https://escuelamps.com',
      logo: 'https://escuelamps.com/images/logo2.png',
      image: 'https://escuelamps.com/images/music_studio_mockup_1783393563250.jpg',
      description:
        'Academia artística integral en Bogotá especializada en clases personalizadas y ensambles de música, técnica vocal, producción musical en DAW y actuación teatral.',
      telephone: '+573228498877',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Bogotá D.C.',
        addressLocality: 'Bogotá',
        addressRegion: 'Cundinamarca',
        addressCountry: 'CO',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '4.60971',
        longitude: '-74.08175',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '20:00',
        },
      ],
      sameAs: [
        'https://www.instagram.com/escuelamps',
        'https://www.facebook.com/escuelamps',
      ],
    },
    {
      '@type': 'ItemList',
      name: 'Cursos y Cátedras Oficiales MPS',
      itemListElement: [
        {
          '@type': 'Course',
          position: 1,
          name: 'Clases de Técnica Vocal y Canto',
          description:
            'Desarrollo de afinación, respiración diafragmática, proyección y repertorio en vivo.',
          provider: { '@id': 'https://escuelamps.com/#organization' },
        },
        {
          '@type': 'Course',
          position: 2,
          name: 'Clases de Piano y Teclados',
          description:
            'Lectura de partituras, digitación, armonía moderna, repertorio clásico y contemporáneo.',
          provider: { '@id': 'https://escuelamps.com/#organization' },
        },
        {
          '@type': 'Course',
          position: 3,
          name: 'Clases de Guitarra Eléctrica y Acústica',
          description:
            'Acordes, escalas, fraseo, solos, ritmo y acompañamiento integral.',
          provider: { '@id': 'https://escuelamps.com/#organization' },
        },
        {
          '@type': 'Course',
          position: 4,
          name: 'Clases de Batería y Percusión',
          description:
            'Independencia de extremidades, técnica de baquetas, grooves y métricas complejas.',
          provider: { '@id': 'https://escuelamps.com/#organization' },
        },
        {
          '@type': 'Course',
          position: 5,
          name: 'MPS PRODUCER: Producción Musical y Grabación',
          description:
            'DAW, mezcla, grabación en vivo, microfonía y masterización profesional.',
          provider: { '@id': 'https://escuelamps.com/#organization' },
        },
        {
          '@type': 'Course',
          position: 6,
          name: 'Taller de Actuación y Expresión Escénica',
          description:
            'Arte dramático, manejo corporal, dicción, actuación para cámara y montaje teatral.',
          provider: { '@id': 'https://escuelamps.com/#organization' },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <FirebaseAnalytics />
        <SessionTimeout />
        {children}
        <ThemeToggle />
        <CookieBanner />
      </body>
    </html>
  );
}
