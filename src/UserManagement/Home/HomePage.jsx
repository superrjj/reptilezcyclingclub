import React, { useRef } from 'react';
import Hero from './Hero.jsx';
import Welcome from './Welcome.jsx';
import Cards from './Cards.jsx';
import Events from './Events.jsx';
import Gallery from './Gallery.jsx';
import Footer from './Footer.jsx';
import { useTabVisibility } from '../../hooks/useTabVisibility';
import { usePageMeta } from '../../hooks/usePageMeta';

const HomePage = () => {
  const refreshFunctionsRef = useRef([]);

  // Combined refresh function for all components
  const refreshAll = async () => {
    const promises = refreshFunctionsRef.current
      .filter(fn => fn && typeof fn === 'function')
      .map(fn => fn().catch(err => console.error('Error refreshing component:', err)));
    await Promise.all(promises);
  };

  useTabVisibility(refreshAll);
  usePageMeta(''); // base title only: "D&R Reptilez Sports"

  return (
    <div className="flex flex-col gap-12 pb-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <Hero refreshFunctionsRef={refreshFunctionsRef} />
      <Welcome />
      <Cards refreshFunctionsRef={refreshFunctionsRef} />
      <Events refreshFunctionsRef={refreshFunctionsRef} />
      <Gallery refreshFunctionsRef={refreshFunctionsRef} />
      <Footer />
    </div>
  );
};

export default HomePage;

