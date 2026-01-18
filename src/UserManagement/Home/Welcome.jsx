import React from 'react';
import GradientText from '../../components/ui/gradient-text';

const Welcome = () => {
  return (
    <section className="flex flex-col items-center gap-4 text-center px-4">
      <GradientText
        className="text-[22px] sm:text-3xl font-bold leading-tight tracking-[-0.015em]"
        animationDuration={2}
      >
        Welcome to D&R Reptilez Sports
      </GradientText>
      <p className="text-white/80 text-base font-normal leading-normal max-w-2xl">
        This cycling team is for group rides and road races. We are a passionate group of riders dedicated to pushing our limits and building a strong, supportive community. Whether you're a seasoned pro or just starting out, there's a place for you in our pack.
      </p>
    </section>
  );
};

export default Welcome;

