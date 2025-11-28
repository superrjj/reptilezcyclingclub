import React from 'react';
import Hero from './Hero.jsx';
import Welcome from './Welcome.jsx';
import Cards from './Cards.jsx';
import Events from './Events.jsx';
import Gallery from './Gallery.jsx';
import Footer from './Footer.jsx';

const HomePage = () => {
  return (
    <>
      <main className="flex flex-col gap-10 md:gap-16 mt-5">
        <Hero />
        <Welcome />
        <Cards />
        <Events />
        <Gallery />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;

