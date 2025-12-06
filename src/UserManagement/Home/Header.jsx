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

  useEffect(() => {
    setIsAdmin(!!(user && user.isAdmin));
  }, [user]);

  useEffect(() => {
    if (!maintenanceVisible) return;
    const timer = setTimeout(() => setMaintenanceVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [maintenanceVisible]);

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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-solid border-primary/30 bg-background-dark/95 backdrop-blur">
      {maintenanceVisible && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl border border-primary/50 bg-black/90 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          Hindi pa po ito tapos by Dev Harvee
        </div>
      )}
      <div className="mx-auto flex max-w-[960px] items-center justify-between whitespace-nowrap px-4 py-4 sm:px-10">
        <Link
          to="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="flex items-center gap-4 text-white"
        >
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
        </Link>
        <div className="hidden md:flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <Link 
              to="/" 
              onClick={(e) => handleLinkClick(e, '/')}
              className={`text-base font-semibold leading-relaxed tracking-wide transition-colors ${
                location.pathname === '/' ? 'text-primary' : 'text-white hover:text-primary'
              }`}
            >
              Home
            </Link>
            <Link
              to="/posts"
              onClick={(e) => handleLinkClick(e, '/posts')}
              className={`text-base font-semibold leading-relaxed tracking-wide transition-colors ${
                location.pathname === '/posts' ? 'text-primary' : 'text-white hover:text-primary'
              }`}
            >
              Posts
            </Link>
            <Link
              to="/events"
              onClick={(e) => handleLinkClick(e, '/events')}
              className={`text-base font-semibold leading-relaxed tracking-wide transition-colors ${
                location.pathname === '/events' ? 'text-primary' : 'text-white hover:text-primary'
              }`}
            >
              Events
            </Link>
            <Link 
              to="/members" 
              onClick={(e) => handleLinkClick(e, '/members')}
              className={`text-base font-semibold leading-relaxed tracking-wide transition-colors ${
                location.pathname === '/members' ? 'text-primary' : 'text-white hover:text-primary'
              }`}
            >
              Members
            </Link>
            <Link
              to="/about-us"
              onClick={(e) => handleLinkClick(e, '/about-us')}
              className={`text-base font-semibold leading-relaxed tracking-wide transition-colors ${
                location.pathname === '/about-us' ? 'text-primary' : 'text-white hover:text-primary'
              }`}
            >
              About Us
            </Link>
          </div>
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <span className="text-primary text-base font-semibold tracking-wide">Admin</span>
              <button
                onClick={handleLogout}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-accent text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-red-600 transition-colors"
              >
                <span className="truncate">LOGOUT</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-700 transition-colors"
            >
              <span className="truncate">LOGIN</span>
            </button>
          )}
        </div>
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-full border border-white/15 bg-white/5 p-2 text-white transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="material-symbols-outlined text-3xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-4 top-24 z-50 flex origin-top scale-100 flex-col gap-4 rounded-2xl border border-white/10 bg-background-dark/98 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.85)] transition">
            <nav className="flex flex-col gap-3">
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
                  className={`rounded-xl px-4 py-3 text-lg font-semibold transition ${
                    location.pathname === item.path
                      ? 'bg-primary/15 text-primary'
                      : 'text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="rounded-2xl border border-white/10 p-4 shadow-inner shadow-black/30">
              {isAdmin ? (
                <div className="flex flex-col gap-3">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                    Admin
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center rounded-xl bg-accent py-3 text-base font-bold text-white transition hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick();
                  }}
                  className="flex items-center justify-center rounded-xl bg-primary py-3 text-base font-bold text-white transition hover:bg-green-700"
                >
                  Login
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

