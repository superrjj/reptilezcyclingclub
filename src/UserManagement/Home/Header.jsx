import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LONG_PRESS_MS = 3000;

// MorphingNav component
const MorphingNav = ({ items, value, onValueChange, className = '', itemClassName = '' }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ opacity: 0 });
  const navRef = useRef(null);
  const activeRef = useRef(null);

  const updateIndicator = () => {
    if (activeRef.current && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const activeRect = activeRef.current.getBoundingClientRect();
      setIndicatorStyle({
        opacity: 1,
        left: activeRect.left - navRect.left,
        width: activeRect.width,
        height: activeRect.height,
        top: activeRect.top - navRect.top,
      });
    }
  };

  useLayoutEffect(() => { updateIndicator(); }, [value]);
  useEffect(() => { updateIndicator(); }, []);

  return (
    <div className={`relative flex items-center ${className}`}>
      <div
        ref={navRef}
        className="relative flex items-center gap-1 p-1"
      >
        <div
          className="absolute rounded-full bg-reptilez-green-600 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-sm"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            height: indicatorStyle.height,
            top: indicatorStyle.top,
            opacity: indicatorStyle.opacity,
          }}
        />
        {items.map((item) => {
          const isActive = value === item.id;
          return (
            <button
              key={item.id}
              ref={isActive ? activeRef : null}
              onClick={() => onValueChange(item.id)}
              className={`relative z-10 rounded-full text-sm font-semibold tracking-wide transition-colors duration-200 font-sans-simple ${itemClassName} ${
                isActive ? 'text-white' : 'text-gray-600 hover:text-reptilez-green-700'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SECTION_ORDER = ['home', 'posts', 'events', 'members', 'about'];
const SECTION_IDS = {
  home: null,
  posts: 'posts',
  events: 'events',
  members: 'members',
  about: 'about-us',
};

const Header = ({ onLongPressTitle, offsetTop = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const isManualScrollRef = useRef(false);
  const manualScrollTimerRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const longPressProgressRef = useRef(0);
  const longPressTriggeredRef = useRef(false);

  useEffect(() => {
    setIsAdmin(!!(user && user.isAdmin));
  }, [user]);

  // Scroll spy
  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      if (isManualScrollRef.current) return;

      const scrollY = window.scrollY;

      if (scrollY < 50) {
        setActiveNav('home');
        return;
      }

      let current = 'home';
      for (const id of SECTION_ORDER) {
        const sectionId = SECTION_IDS[id];
        if (!sectionId) continue;
        const el = document.getElementById(sectionId);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + scrollY - 80;
        if (scrollY >= top - 50) {
          current = id;
        }
      }
      setActiveNav(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    setIsAdmin(false);
    window.location.reload();
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearInterval(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressProgressRef.current = 0;
  };

  const startLongPress = () => {
    clearLongPress();
    longPressProgressRef.current = 0;
    longPressTimerRef.current = setInterval(() => {
      longPressProgressRef.current += 100;
      if (longPressProgressRef.current >= LONG_PRESS_MS) {
        clearLongPress();
        longPressTriggeredRef.current = true;
        onLongPressTitle?.();
      }
    }, 100);
  };

  const endLongPress = () => clearLongPress();

  useEffect(() => {
    return () => clearLongPress();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = '';
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (e, path, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (sectionId) {
      if (location.pathname === '/') {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
      return;
    }
    if (location.pathname === path) return;
    navigate(path);
  };

  const navItems = [
    { label: 'HOME', path: '/' },
    { label: 'POSTS', path: '/', sectionId: 'posts' },
    { label: 'EVENTS', path: '/', sectionId: 'events' },
    { label: 'MEMBERS', path: '/', sectionId: 'members' },
    { label: 'ABOUT US', path: '/', sectionId: 'about-us' },
  ];

  const morphingNavItems = [
    { id: 'home', label: 'HOME', path: '/', sectionId: null },
    { id: 'posts', label: 'POSTS', path: '/', sectionId: 'posts' },
    { id: 'events', label: 'EVENTS', path: '/', sectionId: 'events' },
    { id: 'members', label: 'MEMBERS', path: '/', sectionId: 'members' },
    { id: 'about', label: 'ABOUT US', path: '/', sectionId: 'about-us' },
  ];

  const handleMorphingNavChange = (id) => {
    setActiveNav(id);

    // Pause scroll spy so click doesn't get overridden by scroll event
    isManualScrollRef.current = true;
    if (manualScrollTimerRef.current) clearTimeout(manualScrollTimerRef.current);
    manualScrollTimerRef.current = setTimeout(() => {
      isManualScrollRef.current = false;
    }, 1000);

    const item = morphingNavItems.find((i) => i.id === id);
    if (!item) return;
    if (item.sectionId) {
      if (location.pathname === '/') {
        document.getElementById(item.sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.getElementById(item.sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    } else {
      if (location.pathname !== item.path) navigate(item.path);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className="fixed inset-x-0 z-50 border-b border-gray-200 bg-white shadow-sm"
      style={{ top: offsetTop }}
    >
      <div className="mx-auto flex w-full items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-5">
        <Link
          to="/"
          onClick={(e) => {
            if (longPressTriggeredRef.current) {
              e.preventDefault();
              longPressTriggeredRef.current = false;
              return;
            }
            handleLinkClick(e, '/');
          }}
          className="group flex items-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center gap-1 sm:gap-2 relative">
            {['/rcc1.png', '/rcc3.png'].map((src, idx) => (
              <img
                key={src}
                src={src}
                alt="Reptilez Cycling Club logo"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-contain transition-transform duration-300 group-hover:scale-105"
                style={{ transitionDelay: `${idx * 50}ms` }}
              />
            ))}
          </div>
          <h2
            className="font-sans-simple relative text-gray-900 text-base sm:text-lg md:text-xl font-semibold leading-tight tracking-tight text-balance select-none"
            onTouchStart={startLongPress}
            onTouchEnd={endLongPress}
            onTouchCancel={endLongPress}
            onMouseDown={startLongPress}
            onMouseUp={endLongPress}
            onMouseLeave={endLongPress}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Reptilez Cycling Club
          </h2>
        </Link>

        {/* Desktop: MorphingNav */}
        <div className="hidden md:flex flex-1 justify-end items-center gap-6">
          <MorphingNav
            items={morphingNavItems}
            value={activeNav}
            onValueChange={handleMorphingNavChange}
            itemClassName="px-5 py-2.5 text-sm"
          />
          {isAdmin && (
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-reptilez-green-700 text-xs sm:text-sm font-semibold tracking-wider uppercase font-sans-simple hidden sm:block">
                Admin
              </span>
              <button
                onClick={handleLogout}
                className="font-sans-simple rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 bg-red-600 text-white text-xs sm:text-sm font-medium transition-all duration-300 hover:bg-red-700"
              >
                LOGOUT
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="relative rounded-lg bg-white p-2.5 text-gray-700 transition-all duration-300 hover:text-reptilez-green-600 focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/30 animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col"
            style={{ animation: 'slideInRight 0.3s ease-out' }}
          >
            <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
            <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest font-sans-simple">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-4 flex-1">
              {navItems.map((item) => {
                const matchId = morphingNavItems.find((m) => m.label === item.label)?.id;
                const isActive = activeNav === matchId;
                return (
                  <Link
                    key={item.label}
                    to={item.sectionId && location.pathname === '/' ? `/#${item.sectionId}` : item.path}
                    onClick={(e) => handleLinkClick(e, item.path, item.sectionId || null)}
                    className={`rounded-xl px-4 py-3 text-base font-semibold transition-all duration-200 font-sans-simple ${
                      isActive
                        ? 'bg-reptilez-green-50 text-reptilez-green-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-reptilez-green-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {isAdmin && (
              <div className="p-4 border-t border-gray-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-reptilez-green-700 font-sans-simple block px-2 mb-2">
                  Admin
                </span>
                <button
                  onClick={handleLogout}
                  className="font-sans-simple w-full rounded-xl py-3 bg-red-600 text-base font-medium text-white transition-all duration-300 hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;