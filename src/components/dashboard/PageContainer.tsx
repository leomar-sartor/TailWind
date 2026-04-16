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
      </section>
    );
  }

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 rounded-3xl border dashboard-border dashboard-card p-6 shadow-xl shadow-[0_20px_60px_-40px_rgba(43,44,64,0.12)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-orange-400/90">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#384551] sm:text-3xl">{description}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}
