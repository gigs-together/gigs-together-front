'use client';

import dynamic from 'next/dynamic';

const AdminApp = dynamic(() => import('@/app/admin/_components/AdminApp'), {
  ssr: false,
  loading: () => <div>Loading admin...</div>,
});

export default function AdminPage() {
  return <AdminApp />;
}
