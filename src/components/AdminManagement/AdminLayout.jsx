import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [logoutProcessing, setLogoutProcessing] = useState(false);
  const logoutTimerRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !isSupabaseConfigured || !supabase) return;
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleLogout = () => {
    setConfirmLogoutOpen(true);
  };

  const cancelLogout = () => {
    if (logoutProcessing) return;
    setConfirmLogoutOpen(false);
  };

  const confirmLogout = () => {
    if (logoutProcessing) return;
    setLogoutProcessing(true);
    logoutTimerRef.current = setTimeout(async () => {
      await signOut();
      setLogoutProcessing(false);
      setConfirmLogoutOpen(false);
      navigate('/');
    }, 2000);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getDisplayName = () => {
    if (!profile) return 'Admin';

    const first = profile.first_name?.trim() || '';
    const last = profile.last_name?.trim() || '';
    const full = `${first}${last ? ` ${last}` : ''}`.trim();

    if (!full) return 'Admin';

    // If name is short enough, show full
    if (full.length <= 18) return full;

    // Otherwise, truncate and add ellipsis
    return `${full.slice(0, 18).trim()}...`;
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

  useEffect(() => {
    if (!confirmLogoutOpen) {
      document.body.style.overflow = '';
      return undefined;
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !logoutProcessing) {
        cancelLogout();
      }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmLogoutOpen, logoutProcessing]);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200">
      {confirmLogoutOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl px-3 sm:px-4 animate-[fadeIn_0.3s_ease-out]"
          onClick={(e) => e.target === e.currentTarget && !logoutProcessing && cancelLogout()}
        >
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border-2 border-red-500/40 bg-gradient-to-br from-black via-gray-900/95 to-black p-4 sm:p-5 md:p-6 shadow-[0_0_80px_rgba(220,38,38,0.15),0_40px_140px_rgba(0,0,0,0.9)] animate-[slideUp_0.4s_ease-out] relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 animate-pulse"></div>
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="relative z-10">
              {/* Close Button */}
              <div className="flex justify-end mb-3">
                <button
                  className="text-white/60 hover:text-white transition-all duration-300 hover:rotate-90 hover:scale-110 rounded-lg p-1 hover:bg-white/10"
                  onClick={cancelLogout}
                  type="button"
                  disabled={logoutProcessing}
                  aria-label="Close dialog"
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
                </button>
              </div>

              {/* Header */}
              <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/30 blur-xl rounded-full animate-pulse"></div>
                  <div className="relative flex size-14 sm:size-16 items-center justify-center rounded-full border-2 border-red-500/50 bg-gradient-to-br from-red-600/20 to-red-700/20 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-2xl sm:text-3xl text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">logout</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mb-1 bg-clip-text bg-gradient-to-r from-white via-red-400 to-white">
                    Sign Out?
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-medium">
                    You will be redirected back to the public site
                  </p>
                </div>
              </div>

              {/* Warning Message */}
              <div className="mb-4 sm:mb-5 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-red-500/10 border-2 border-red-400/30 backdrop-blur-sm">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <span className="material-symbols-outlined text-red-400 text-base sm:text-lg flex-shrink-0 mt-0.5">info</span>
                  <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
                    Are you sure you want to sign out from the Admin?.
                  </p>
                </div>
              </div>

              {/* Action Button - Centered */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="group relative rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-8 sm:px-10 py-2.5 sm:py-3 text-sm sm:text-base font-black uppercase tracking-wider text-white transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                  disabled={logoutProcessing}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {logoutProcessing ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                        <span>Signing out...</span>
                      </>
                    ) : (
                      <>
                        <span>Yes, Logout</span>
                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex h-screen">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="fixed top-4 left-4 z-50 md:hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* SideNavBar */}
        <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 flex-shrink-0 bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-center px-2 py-2">
                <img
                  src="/rcc2.png"
                  alt="Reptilez Cycling Club logo"
                  className="size-10 rounded-full object-contain"
                />
                <div className="flex flex-col">
                  {profileLoading && !profile ? (
                    <>
                      <div className="h-4 w-28 rounded-full shimmer-bg" />
                      <div className="mt-1 h-3 w-16 rounded-full shimmer-bg" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-gray-900 dark:text-white text-base font-bold leading-normal">
                        {getDisplayName()}
                      </h1>
                      <p className="text-primary text-sm font-normal leading-normal">Admin</p>
                    </>
                  )}
                </div>
              </div>
              
              <nav className="flex flex-col gap-2 mt-4">
                <a 
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin') 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  href="/admin"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <p className="text-sm font-medium leading-normal">Dashboard</p>
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin/posts') 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  href="/admin/posts"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate('/admin/posts');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined" style={isActive('/admin/posts') ? { fontVariationSettings: "'FILL' 1" } : {}}>article</span>
                  <p className="text-sm font-medium leading-normal">Posts</p>
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin/events') 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  href="/admin/events"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate('/admin/events');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined" style={isActive('/admin/events') ? { fontVariationSettings: "'FILL' 1" } : {}}>event</span>
                  <p className="text-sm font-medium leading-normal">Events</p>
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin/members') 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  href="/admin/members"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate('/admin/members');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined" style={isActive('/admin/members') ? { fontVariationSettings: "'FILL' 1" } : {}}>groups</span>
                  <p className="text-sm font-medium leading-normal">Members</p>
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin/file-maintenance') 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  href="/admin/file-maintenance"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate('/admin/file-maintenance');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined" style={isActive('/admin/file-maintenance') ? { fontVariationSettings: "'FILL' 1" } : {}}>folder_open</span>
                  <p className="text-sm font-medium leading-normal">File Maintenance</p>
                </a>
              </nav>
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-left w-full" 
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined">settings</span>
                <p className="text-sm font-medium leading-normal">Settings</p>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-left w-full"
              >
                <span className="material-symbols-outlined">logout</span>
                <p className="text-sm font-medium leading-normal">Logout</p>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;

