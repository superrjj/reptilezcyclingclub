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
    <>
      <main className="flex flex-col gap-10 md:gap-16 mt-5">
        <Hero refreshFunctionsRef={refreshFunctionsRef} />
        <Welcome />
        <Cards refreshFunctionsRef={refreshFunctionsRef} />
        <Events refreshFunctionsRef={refreshFunctionsRef} />
        <Gallery refreshFunctionsRef={refreshFunctionsRef} />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;

