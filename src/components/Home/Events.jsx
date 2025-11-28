import React from 'react';

const Events = () => {
  const events = [
    {
      title: "Larga Pilipinas",
      date: "November 29, 2025 - Nampicuan"
    },
    {
      title: "Larga Pilipinas",
      date: "November 30, 2025 - Nampicuan to Sitio Baag"
    }
  ];

  return (
    <section className="flex flex-col items-center gap-6 px-4 py-8">
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] sm:text-3xl">Upcoming Events</h2>
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {events.map((event, index) => (
          <div key={index} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-primary/30 rounded-lg bg-black/40 backdrop-blur-sm">
            <div className="text-center sm:text-left">
              <p className="text-white font-semibold">{event.title}</p>
              <p className="text-white/60 text-sm">{event.date}</p>
            </div>
            <button className="flex-shrink-0 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/20 text-primary border border-primary/50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary hover:text-black transition-colors">
              <span className="truncate">View Details</span>
            </button>
          </div>
        ))}
      </div>
      <button className="mt-4 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-black text-base font-bold leading-normal tracking-[0.015em] hover:bg-accent hover:text-white transition-colors">
        <span className="truncate">View All Events</span>
      </button>
    </section>
  );
};

export default Events;

