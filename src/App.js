import React, { useState } from 'react';
import './App.css';
import Header from './components/Home/Header.jsx';
import Hero from './components/Home/Hero.jsx';
import Welcome from './components/Home/Welcome.jsx';
import Cards from './components/Home/Cards.jsx';
import Events from './components/Home/Events.jsx';
import Gallery from './components/Home/Gallery.jsx';
import Footer from './components/Home/Footer.jsx';
import LoginDialog from './components/common/LoginDialog.jsx';

function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden text-white"
      style={{
        backgroundImage:
          'linear-gradient(135deg, #020202 0%, #0a2b0a 35%, #0b0b0b 65%, #2b0000 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1 pt-24">
            <Header onLoginClick={() => setLoginOpen(true)} />
            <main className="flex flex-col gap-10 md:gap-16 mt-5">
              <Hero />
              <Welcome />
              <Cards />
              <Events />
              <Gallery />
            </main>
            <Footer />
          </div>
        </div>
      </div>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

export default App;
