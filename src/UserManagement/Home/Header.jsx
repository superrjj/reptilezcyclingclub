import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onLoginClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [maintenanceVisible, setMaintenanceVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsAdmin(!!(user && user.isAdmin));
  }, [user]);

  useEffect(() => {
    if (!maintenanceVisible) return;
    const timer = setTimeout(() => setMaintenanceVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [maintenanceVisible]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsAdmin(false);
    window.location.reload();
  };

  const handleMaintenanceClick = (e) => {
    e.preventDefault();
    setMaintenanceVisible(true);
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
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'border-b border-primary/40 bg-black/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,255,0,0.1)]' 
          : 'border-b border-primary/20 bg-black/70 backdrop-blur-lg'
      }`}
    >
      {maintenanceVisible && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-[slideDown_0.3s_ease-out] rounded-2xl border-2 border-primary/60 bg-gradient-to-br from-black via-gray-900 to-black px-8 py-4 text-sm font-bold text-white shadow-[0_0_40px_rgba(0,255,0,0.3),0_20px_60px_rgba(0,0,0,0.8)]">
          <span className="relative">
            Hindi pa po ito tapos by Dev Harvee
            <span className="absolute -inset-1 animate-pulse rounded-xl bg-primary/20 blur-sm -z-10"></span>
          </span>
        </div>
      )}
      
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5 sm:px-12">
        <Link
          to="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="group flex items-center gap-4 transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-2 relative">
            {['/rcc1.png', '/rcc2.png', '/rcc3.png'].map((src, idx) => (
              <div 
                key={src}
                className="relative transition-transform duration-300 group-hover:scale-110"
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                <img
                  src={src}
                  alt="Reptilez Cycling Club logo"
                  className="h-10 w-10 rounded-full object-contain ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            ))}
          </div>
          
          <h2 className="relative text-white text-xl font-black leading-tight tracking-tight bg-clip-text bg-gradient-to-r from-white via-primary to-white group-hover:from-primary group-hover:via-white group-hover:to-primary transition-all duration-500">
            D&R Reptilez Sports
            <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-full transition-all duration-500"></span>
          </h2>
        </Link>

        <div className="hidden md:flex flex-1 justify-end gap-10">
          <nav className="flex items-center gap-8">
            {[
              { label: 'Home', path: '/' },
              { label: 'Posts', path: '/posts' },
              { label: 'Events', path: '/events' },
              { label: 'Members', path: '/members' },
              { label: 'About Us', path: '/about-us' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleLinkClick(e, item.path)}
                className={`group relative text-base font-bold tracking-wide transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'text-primary' 
                    : 'text-white/90 hover:text-primary'
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-[3px] bg-gradient-to-r from-primary via-green-400 to-primary transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'w-full shadow-[0_0_10px_rgba(0,255,0,0.6)]' 
                    : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
          </nav>

          {isAdmin ? (
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="text-primary text-sm font-black tracking-widest uppercase">Admin</span>
                <div className="absolute -inset-1 bg-primary/20 blur-sm rounded -z-10 animate-pulse"></div>
              </div>
              <button
                onClick={handleLogout}
                className="group relative overflow-hidden rounded-xl px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]"
              >
                <span className="relative z-10">LOGOUT</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="group relative overflow-hidden rounded-xl px-6 py-2.5 bg-gradient-to-r from-primary to-green-600 text-white text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(0,255,0,0.5)]"
            >
              <span className="relative z-10">LOGIN</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
        </div>

        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="relative rounded-xl border-2 border-primary/40 bg-gradient-to-br from-black/60 to-gray-900/60 p-2.5 text-white transition-all duration-300 hover:border-primary hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] focus:outline-none focus:ring-2 focus:ring-primary/60"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="material-symbols-outlined text-3xl transition-transform duration-300" style={{ transform: mobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-4 top-24 z-50 animate-[slideDown_0.3s_ease-out] origin-top rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-black via-gray-900 to-black p-8 shadow-[0_0_60px_rgba(0,255,0,0.2),0_30px_90px_rgba(0,0,0,0.95)]">
            <nav className="flex flex-col gap-2">
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
                  className={`group relative overflow-hidden rounded-2xl px-5 py-4 text-lg font-bold transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-primary/20 to-green-600/20 text-primary shadow-[inset_0_0_20px_rgba(0,255,0,0.2)]'
                      : 'text-white/90 hover:bg-white/5 hover:text-primary'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <span className="relative z-10">{item.label}</span>
                  {location.pathname === item.path && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse"></div>
                  )}
                </Link>
              ))}
            </nav>

            <div className="pt-6 mt-6 border-t-2 border-primary/30">
              {isAdmin ? (
                <div className="flex flex-col gap-4">
                  <div className="relative inline-block">
                    <div className="text-xs font-black uppercase tracking-[0.25em] text-primary px-2">
                      Admin Access
                    </div>
                    <div className="absolute -inset-1 bg-primary/20 blur-md rounded -z-10 animate-pulse"></div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="group relative overflow-hidden flex items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-red-700 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] w-full"
                  >
                    <span className="relative z-10">Logout</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick();
                  }}
                  className="group relative overflow-hidden flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-green-600 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] w-full"
                >
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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