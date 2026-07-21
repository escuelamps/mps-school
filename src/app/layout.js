import './globals.css';
import { Montserrat } from 'next/font/google';
import FirebaseAnalytics from '@/components/FirebaseAnalytics';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata = {
  title: 'MPS | Music and Production School',
  description: 'Academia artística dedicada a la formación integral en música, producción, actuación y fotografía.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={montserrat.className}>
      <body>
        <FirebaseAnalytics />
        {children}
      </body>
    </html>
  );
}
