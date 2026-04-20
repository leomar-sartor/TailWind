import React from 'react';

type PageContainerProps = {
  loading: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function PageContainer({ loading, title, description, children }: PageContainerProps) {
  if (loading) {
    return (
      <section className="space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto pb-24 pt-2 space-y-5">
          <div className="h-12 w-3/4 rounded-2xl bg-[#E4E6E8]/70 animate-pulse" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-36 rounded-3xl bg-[#E4E6E8]/70 animate-pulse" />
            <div className="h-36 rounded-3xl bg-[#E4E6E8]/70 animate-pulse" />
            <div className="h-36 rounded-3xl bg-[#E4E6E8]/70 animate-pulse" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-48 rounded-3xl bg-[#E4E6E8]/70 animate-pulse" />
            <div className="h-48 rounded-3xl bg-[#E4E6E8]/70 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-2 py-2 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto pb-24 pt-2">
        <div className="mb-2 flex flex-col gap- rounded-3xl border dashboard-border dashboard-card p-2 ps-4 shadow-xl shadow-[0_20px_60px_-40px_rgba(43,44,64,0.12)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-[#6C7287]">
            <span className="uppercase tracking-[0.32em] text-orange-400/90">{title}</span>
            <span className="text-[#CBD5E1]">/</span>
            <span className="font-semibold text-[#384551]">{description}</span>
          </nav>
        </div>
        {children}
      </div>
    </section>
  );
}
