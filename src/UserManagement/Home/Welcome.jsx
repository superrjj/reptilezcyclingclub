import React, { useState, useEffect, useRef } from 'react';
import GradientText from '../../components/ui/gradient-text';

const Welcome = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      data-animate
      className={`flex flex-col items-center gap-4 text-center py-8 sm:py-12 transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <GradientText
        className="text-[22px] sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]"
        animationDuration={2}
      >
        Welcome to Reptilez Cycling Club
      </GradientText>
      <p className="text-gray-700 text-base sm:text-lg font-normal leading-relaxed max-w-3xl">
        This cycling team is for group rides and road races. We are a passionate group of riders dedicated to pushing our limits and building a strong, supportive community. Whether you're a seasoned pro or just starting out, there's a place for you in our pack.
      </p>
    </section>
  );
};

export default Welcome;
