import './globals.css';
import FirebaseAnalytics from '@/components/FirebaseAnalytics';
import ThemeToggle from '@/components/ThemeToggle';
import CookieBanner from '@/components/CookieBanner';
import SessionTimeout from '@/components/SessionTimeout';

export const metadata = {
  title: 'MPS | Music and Production School',
  description: 'Academia artística dedicada a la formación integral en música, producción, actuación y fotografía.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
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
