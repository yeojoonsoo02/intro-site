'use client';

import AdminAuthGate from '@/features/admin/AdminAuthGate';
import PortfolioContent from '@/features/portfolio/PortfolioContent';

export default function AdminPage() {
  return (
    <AdminAuthGate>
      <main style={{ background: 'var(--background)' }}>
        <PortfolioContent isAdmin />
      </main>
    </AdminAuthGate>
  );
}
