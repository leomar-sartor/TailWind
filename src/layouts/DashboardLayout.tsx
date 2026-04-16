import React from 'react';

type DashboardLayoutProps = {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  contentClassName: string;
  children: React.ReactNode;
};

export function DashboardLayout({
  sidebar,
  header,
  footer,
  contentClassName,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col dashboard-bg text-[#384551]">
      <div className="fixed inset-x-0 top-0 h-1 bg-orange-500 z-50" />
      {sidebar}
      {header}
      <main className={`flex-1 pt-16 transition-all duration-300 ${contentClassName}`}>
        {children}
      </main>
      {footer}
    </div>
  );
}
