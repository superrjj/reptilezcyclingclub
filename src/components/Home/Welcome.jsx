import React from 'react';

const Welcome = () => {
  return (
    <section className="flex flex-col items-center gap-4 text-center px-4">
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] sm:text-3xl">Welcome to Reptilez</h2>
      <p className="text-white/80 text-base font-normal leading-normal max-w-2xl">
        This cycling team is for group rides and road races. We are a passionate group of riders dedicated to pushing our limits and building a strong, supportive community. Whether you're a seasoned pro or just starting out, there's a place for you in our pack.
      </p>
    </section>
  );
};

export default Welcome;

