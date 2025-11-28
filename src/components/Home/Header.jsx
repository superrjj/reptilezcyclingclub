import React from 'react';

const Header = ({ onLoginClick }) => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-solid border-primary/30 bg-background-dark/95 backdrop-blur">
      <div className="mx-auto flex max-w-[960px] items-center justify-between whitespace-nowrap px-4 py-3 sm:px-10">
        <div className="flex items-center gap-4 text-white">
          <img
            src="/rcc1.png"
            alt="Reptilez Cycling Club logo"
            className="h-8 w-8 rounded-full object-contain"
          />
          <img
            src="/rcc2.png"
            alt="Reptilez Cycling Club logo"
            className="h-8 w-8 rounded-full object-contain"
          />
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Reptilez Cycling Club</h2>
        </div>
        <div className="hidden md:flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <a className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Home</a>
            <a className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">About Us</a>
            <a className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Members</a>
            <a className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Events</a>
            <a className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Posts</a>
          </div>
          <button
            onClick={onLoginClick}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-black text-sm font-bold leading-normal tracking-[0.015em] hover:bg-accent hover:text-white transition-colors"
          >
            <span className="truncate">LOGIN</span>
          </button>
        </div>
        <div className="md:hidden">
          <button className="text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

