import { redirect } from 'next/navigation';

export default function PagosPage({ searchParams }) {
  // Redirigir limpiamente a /checkout conservando cualquier query param
  const query = new URLSearchParams(searchParams).toString();
  redirect(query ? `/checkout?${query}` : '/checkout');
}
