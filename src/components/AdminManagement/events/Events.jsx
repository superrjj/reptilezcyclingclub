import React, { useEffect } from 'react';
import AdminLayout from '../AdminLayout';

const Events = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <AdminLayout>
      <main className="flex-1 flex flex-col bg-black/20 h-full overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto h-full flex items-center justify-center">
          <div className="max-w-xl w-full rounded-2xl border border-primary/40 bg-background-dark px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.8)] flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-center size-14 rounded-full bg-yellow-500/10 border border-yellow-400/40 text-yellow-300">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h1 className="text-white text-2xl font-bold tracking-[-0.02em]">Events Management</h1>
            <p className="text-white/80 text-sm">
              This section is currently <span className="font-semibold text-yellow-300">Under Maintenance</span> by Dev Harvee.
            </p>
            <p className="text-white/60 text-xs">
              You&apos;ll be able to manage upcoming rides and races here soon.
            </p>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default Events;


