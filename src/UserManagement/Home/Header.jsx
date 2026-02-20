import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onLoginClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    setIsAdmin(!!(user && user.isAdmin));
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    setIsAdmin(false);
    window.location.reload();
  };

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = '';
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    if (location.pathname === path) return;
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className="fixed inset-x-0 top-0 z-50 border-b border-reptilez-green-200/50 bg-white/95 backdrop-blur-xl shadow-sm"
    >
      <div className="mx-auto flex w-full items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-5">
        <Link
          to="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="group flex items-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-1 sm:gap-2 relative">
            {['/rcc1.png', '/rcc3.png'].map((src, idx) => (
              <img
                key={src}
                src={src}
                alt="Reptilez Cycling Club logo"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-contain transition-transform duration-300 group-hover:scale-110"
                style={{ transitionDelay: `${idx * 50}ms` }}
              />
            ))}
          </div>
          
          <h2 className="relative text-gray-900 text-base sm:text-lg md:text-xl font-black leading-tight tracking-tight group-hover:text-reptilez-green-700 transition-all duration-500">
            <span>Reptilez Cycling Club</span>
            <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-reptilez-green-600 to-transparent group-hover:w-full transition-all duration-500"></span>
          </h2>
        </Link>

        <div className="hidden md:flex flex-1 justify-end gap-10">
          <nav className="flex items-center gap-8">
            {[
              { label: 'HOME', path: '/' },
              { label: 'POSTS', path: '/posts' },
              { label: 'EVENTS', path: '/events' },
              { label: 'MEMBERS', path: '/members' },
              { label: 'ABOUT US', path: '/about-us' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleLinkClick(e, item.path)}
                className={`group relative text-base font-semibold tracking-wide transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'text-reptilez-green-700' 
                    : 'text-gray-700 hover:text-reptilez-green-600'
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-[3px] bg-gradient-to-r from-reptilez-green-600 via-reptilez-green-500 to-reptilez-green-600 transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'w-full shadow-[0_0_10px_rgba(22,163,74,0.3)]' 
                    : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
          </nav>

          {isAdmin ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative hidden sm:block">
                <span className="text-reptilez-green-700 text-xs sm:text-sm font-black tracking-widest uppercase">Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="group relative overflow-hidden rounded-lg sm:rounded-xl px-3 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <span className="relative z-10">LOGOUT</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="group relative overflow-hidden rounded-lg sm:rounded-xl px-3 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-reptilez-green-600 to-reptilez-green-700 text-white text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <span className="relative z-10">LOGIN</span>
            </button>
          )}
        </div>

        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="relative rounded-lg sm:rounded-xl border-2 border-reptilez-green-300 bg-white p-2 sm:p-2.5 text-gray-700 transition-all duration-300 hover:border-reptilez-green-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-reptilez-green-500/50"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="material-symbols-outlined text-2xl sm:text-3xl transition-transform duration-300" style={{ transform: mobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-3 sm:inset-x-4 top-20 sm:top-24 z-50 animate-[slideDown_0.3s_ease-out] origin-top rounded-2xl sm:rounded-3xl border-2 border-reptilez-green-200 bg-white p-4 sm:p-6 md:p-8 shadow-xl">
            <nav className="flex flex-col gap-1.5 sm:gap-2">
              {[
                { label: 'Home', path: '/' },
                { label: 'Posts', path: '/posts' },
                { label: 'Events', path: '/events' },
                { label: 'Members', path: '/members' },
                { label: 'About Us', path: '/about-us' },
              ].map((item, idx) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg font-bold transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-reptilez-green-50 text-reptilez-green-700 shadow-sm border border-reptilez-green-200'
                      : 'text-gray-700 hover:bg-reptilez-green-50 hover:text-reptilez-green-700'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="pt-6 mt-6 border-t-2 border-reptilez-green-100">
              {isAdmin ? (
                <div className="flex flex-col gap-4">
                  <div className="relative inline-block">
                    <div className="text-xs font-black uppercase tracking-[0.25em] text-reptilez-green-700 px-2">
                      Admin Access
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="group relative overflow-hidden flex items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-red-700 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg w-full"
                  >
                    <span className="relative z-10">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick();
                  }}
                  className="group relative overflow-hidden flex items-center justify-center rounded-2xl bg-gradient-to-r from-reptilez-green-600 to-reptilez-green-700 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg w-full"
                >
                  <span className="relative z-10">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
