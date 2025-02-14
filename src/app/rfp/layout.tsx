'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

export default function RfpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.2),rgba(255,255,255,0))]"></div>
        </div>
        <div className="absolute inset-0 bg-noise mix-blend-soft-light opacity-[0.15]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1),rgba(255,255,255,0.4))]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <MainLayout>{children}</MainLayout>
      </div>
    </div>
  );
} 