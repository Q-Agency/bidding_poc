'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-primary-50 to-secondary-50/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <MainLayout>{children}</MainLayout>
      </div>
    </div>
  );
} 