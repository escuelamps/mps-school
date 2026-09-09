import './globals.css';
import FirebaseAnalytics from '@/components/FirebaseAnalytics';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'MPS | Music and Production School',
  description: 'Academia artística dedicada a la formación integral en música, producción, actuación y fotografía.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <FirebaseAnalytics />
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
