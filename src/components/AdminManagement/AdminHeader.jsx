import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Simple module-level cache so profile is fetched only once even if header remounts
let cachedProfile = null;
let hasLoadedProfile = false;

const AdminHeader = ({ mobileMenuOpen, setMobileMenuOpen, onLogout }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(cachedProfile);
  const [profileLoading, setProfileLoading] = useState(!hasLoadedProfile);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !isSupabaseConfigured || !supabase || hasLoadedProfile) {
        setProfileLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          cachedProfile = data;
          setProfile(data);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      } finally {
        hasLoadedProfile = true;
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const getDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      const first = profile.first_name?.trim() || '';
      const last = profile.last_name?.trim() || '';
      const full = `${first}${last ? ` ${last}` : ''}`.trim();
      if (!full) return 'Admin';
      return full.length <= 18 ? full : `${full.slice(0, 18).trim()}...`;
    }
    return 'Admin';
  };

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/70 dark:border-gray-800/70 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/15 text-primary border border-primary/30">
          <span className="material-symbols-outlined text-lg">account_circle</span>
        </div>
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 font-semibold">Logged in as</p>
          <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
            {profileLoading ? 'Admin' : getDisplayName()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined text-base">{mobileMenuOpen ? 'close' : 'menu'}</span>
          Menu
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;

