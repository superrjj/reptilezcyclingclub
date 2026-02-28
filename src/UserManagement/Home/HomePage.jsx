import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from './Hero.jsx';
import Welcome from './Welcome.jsx';
import Cards from './Cards.jsx';
import PostsSection from './PostsSection.jsx';
import EventsSection from './EventsSection.jsx';
import MembersSection from './MembersSection.jsx';
import Gallery from './Gallery.jsx';
import AboutUsSection from './AboutUsSection.jsx';
import Footer from './Footer.jsx';
import { useTabVisibility } from '../../hooks/useTabVisibility';
import { usePageMeta } from '../../hooks/usePageMeta';

const HomePage = () => {
  const refreshFunctionsRef = useRef([]);
  const location = useLocation();

  // Scroll to section when hash is present (e.g. /#events from Header)
  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [location.hash]);

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
      <PostsSection refreshFunctionsRef={refreshFunctionsRef} />
      <EventsSection refreshFunctionsRef={refreshFunctionsRef} />
      <MembersSection refreshFunctionsRef={refreshFunctionsRef} />
      <Gallery refreshFunctionsRef={refreshFunctionsRef} />
      <AboutUsSection />
      <Footer />
    </div>
  );
};

export default HomePage;
