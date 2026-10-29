import AdminInactivityProvider from './AdminInactivityProvider';

export default function AdminLayout({ children }) {
  return (
    <AdminInactivityProvider>
      {children}
    </AdminInactivityProvider>
  );
}
