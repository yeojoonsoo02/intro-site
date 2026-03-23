'use client';

import dynamic from 'next/dynamic';
import AdminAuthGate from '@/features/admin/AdminAuthGate';

const AdminDashboard = dynamic(() => import('@/features/admin/AdminDashboard'), {
  ssr: false,
});

export default function AdminPage() {
  return (
    <AdminAuthGate>
      <AdminDashboard />
    </AdminAuthGate>
  );
}
