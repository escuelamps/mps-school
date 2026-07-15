import './globals.css';

export const metadata = {
  title: 'MPS | Music and Production School',
  description: 'Academia artística dedicada a la formación integral en música, producción, actuación y fotografía.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
