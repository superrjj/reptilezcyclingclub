import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [logoutProcessing, setLogoutProcessing] = useState(false);
  const logoutTimerRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

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
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-white text-gray-800">

      {/* ── Logout Confirmation Dialog — white theme ── */}
      {confirmLogoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && !logoutProcessing && cancelLogout()}
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#E5E5E5] bg-white px-6 py-6 shadow-xl">
            {/* Icon + text */}
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-500 flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">logout</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">Log out?</p>
                <p className="text-xs text-[#6B7280] mt-0.5">You will be redirected to the login page.</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-5 flex justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={cancelLogout}
                disabled={logoutProcessing}
                className="rounded-lg border border-[#E5E5E5] px-4 py-2 text-[#374151] font-medium hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                disabled={logoutProcessing}
                className="flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 px-4 py-2 font-semibold text-white transition-colors disabled:opacity-60"
              >
                {logoutProcessing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">sync</span>
                    Signing out...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">logout</span>
                    Log out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="fixed top-4 left-4 z-50 md:hidden rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-100 transition-colors"
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
        <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center px-2 py-3">
                <img
                  src="/rcc2.png"
                  alt="Reptilez Cycling Club logo"
                  className="size-16 rounded-full object-contain"
                />
              </div>
              
              <nav className="flex flex-col gap-2 mt-4">
                <a 
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin') 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-gray-900 hover:bg-primary/10 hover:text-primary'
                  }`}
                  href="/admin"
                  onClick={(e) => { e.preventDefault(); navigate('/admin'); setMobileMenuOpen(false); }}
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <p className="text-sm font-medium leading-normal">Dashboard</p>
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin/posts') 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-gray-900 hover:bg-primary/10 hover:text-primary'
                  }`}
                  href="/admin/posts"
                  onClick={(e) => { e.preventDefault(); navigate('/admin/posts'); setMobileMenuOpen(false); }}
                >
                  <span className="material-symbols-outlined" style={isActive('/admin/posts') ? { fontVariationSettings: "'FILL' 1" } : {}}>article</span>
                  <p className="text-sm font-medium leading-normal">Posts</p>
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin/events') 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-gray-900 hover:bg-primary/10 hover:text-primary'
                  }`}
                  href="/admin/events"
                  onClick={(e) => { e.preventDefault(); navigate('/admin/events'); setMobileMenuOpen(false); }}
                >
                  <span className="material-symbols-outlined" style={isActive('/admin/events') ? { fontVariationSettings: "'FILL' 1" } : {}}>event</span>
                  <p className="text-sm font-medium leading-normal">Events</p>
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin/members') 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-gray-900 hover:bg-primary/10 hover:text-primary'
                  }`}
                  href="/admin/members"
                  onClick={(e) => { e.preventDefault(); navigate('/admin/members'); setMobileMenuOpen(false); }}
                >
                  <span className="material-symbols-outlined" style={isActive('/admin/members') ? { fontVariationSettings: "'FILL' 1" } : {}}>groups</span>
                  <p className="text-sm font-medium leading-normal">Members</p>
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin/file-maintenance') 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-gray-900 hover:bg-primary/10 hover:text-primary'
                  }`}
                  href="/admin/file-maintenance"
                  onClick={(e) => { e.preventDefault(); navigate('/admin/file-maintenance'); setMobileMenuOpen(false); }}
                >
                  <span className="material-symbols-outlined" style={isActive('/admin/file-maintenance') ? { fontVariationSettings: "'FILL' 1" } : {}}>folder_open</span>
                  <p className="text-sm font-medium leading-normal">File Maintenance</p>
                </a>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-white">
          <AdminHeader
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            onLogout={handleLogout}
          />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;