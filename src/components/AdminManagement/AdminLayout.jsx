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

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-dark text-white">
      {confirmLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm rounded-2xl border border-primary/40 bg-background-dark px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-2xl">logout</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sign out from Admin Panel?</p>
                <p className="text-xs text-white/70">
                  You will be redirected back to the public site after confirming.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={cancelLogout}
                className="rounded-full border border-white/20 px-4 py-2 text-white/80 hover:bg-white/10 transition-colors"
                disabled={logoutProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 font-semibold text-black shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors disabled:opacity-60"
                disabled={logoutProcessing}
              >
                {logoutProcessing && (
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                )}
                {logoutProcessing ? 'Signing out...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex h-screen">
        {/* SideNavBar */}
        <aside className="w-64 flex-shrink-0 bg-background-dark border-r border-primary/30 h-full overflow-y-auto">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-center px-3 py-2">
                <img
                  src="/rcc2.png"
                  alt="Reptilez Cycling Club logo"
                  className="size-10 rounded-full object-contain"
                />
                <div className="flex flex-col">
                  <h1 className="text-white text-base font-medium leading-normal">
                    {getDisplayName()}
                  </h1>
                  <p className="text-primary/70 text-sm font-normal leading-normal">Admin</p>
                </div>
              </div>
              
              <nav className="flex flex-col gap-2 mt-4">
                <a 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/admin') 
                      ? 'bg-primary/20 text-white' 
                      : 'text-white hover:bg-white/5'
                  }`}
                  href="/admin"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate('/admin'); 
                  }}
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <p className="text-sm font-medium leading-normal">Dashboard</p>
                </a>
                <a 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/admin/posts') 
                      ? 'bg-primary/20 text-white' 
                      : 'text-white hover:bg-white/5'
                  }`}
                  href="/admin/posts"
                  onClick={(e) => { e.preventDefault(); navigate('/admin/posts'); }}
                >
                  <span className="material-symbols-outlined" style={isActive('/admin/posts') ? { fontVariationSettings: "'FILL' 1" } : {}}>article</span>
                  <p className="text-sm font-medium leading-normal">Posts</p>
                </a>
                <a 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/5 transition-colors" 
                  href="/admin/events"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate('/admin/events'); 
                  }}
                >
                  <span className="material-symbols-outlined">event</span>
                  <p className="text-sm font-medium leading-normal">Events</p>
                </a>
                <a 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/5 transition-colors" 
                  href="/admin/members"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate('/admin/members'); 
                  }}
                >
                  <span className="material-symbols-outlined">group</span>
                  <p className="text-sm font-medium leading-normal">Members</p>
                </a>
              </nav>
            </div>
            
            <div className="flex flex-col gap-1">
              <a 
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/5 transition-colors" 
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                <span className="material-symbols-outlined">settings</span>
                <p className="text-sm font-medium leading-normal">Settings</p>
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/5 transition-colors text-left w-full"
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

