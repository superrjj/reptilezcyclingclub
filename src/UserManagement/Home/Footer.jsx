import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-10 border-t border-solid border-primary/30 py-8 px-4 sm:px-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-white">
          <img
            src="/rcc1.png"
            alt="Reptilez Cycling Club logo"
            className="h-6 w-6 rounded-full object-contain"
          />
          <img
            src="/rcc2.png"
            alt="Reptilez Cycling Club logo"
            className="h-6 w-6 rounded-full object-contain"
          />
          <h2 className="text-white text-base font-bold leading-tight">Reptilez Cycling Club</h2>
        </div>
        <div className="flex items-center gap-4">
          <a
            aria-label="Instagram"
            className="text-white/60 hover:text-accent transition-colors"
            href="https://www.instagram.com/reptilezcyclingclub/"
            target="_blank"
            rel="noreferrer"
          >
            <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <rect height="20" rx="5" ry="5" width="20" x="2" y="2"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
            </svg>
          </a>
          <a
            aria-label="Facebook"
            className="text-white/60 hover:text-[#1877F2] transition-colors"
            href="https://www.facebook.com/profile.php?id=61561941841860"
            target="_blank"
            rel="noreferrer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.5c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.3.2 2.3.2v2.6h-1.3c-1.3 0-1.7.8-1.7 1.6v1.9H18l-.4 2.9h-2.7v7A10 10 0 0 0 22 12z" />
            </svg>
          </a>
          <a
            aria-label="TikTok"
            className="text-white/60 hover:text-white transition-colors"
            href="https://www.tiktok.com/@reptilezcyclingclub"
            target="_blank"
            rel="noreferrer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 7.5a6.9 6.9 0 0 1-4.2-1.4v7.1c0 3.2-2.6 5.8-5.8 5.8S5.2 16.4 5.2 13c0-3 2.3-5.5 5.2-5.8v3.2c-1.1.3-1.9 1.3-1.9 2.6 0 1.5 1.2 2.6 2.6 2.6s2.6-1.2 2.6-2.6V2h3.3c.1.8.5 1.6 1 2.2.7.8 1.8 1.3 3 1.3v2z" />
            </svg>
          </a>
        </div>
        <p className="text-sm text-white/60 text-center sm:text-right">© 2021 Reptilez Cycling Club. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

