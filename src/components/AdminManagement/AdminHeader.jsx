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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/70 bg-white/85 backdrop-blur-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/15 text-primary border border-primary/30">
            <span className="material-symbols-outlined text-lg">account_circle</span>
          </div>
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500 font-semibold">Logged in as</p>
            <p className="text-sm sm:text-base font-bold text-gray-900">
              {profileLoading ? 'Admin' : getDisplayName()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-base">{mobileMenuOpen ? 'close' : 'menu'}</span>
            Menu
          </button>
          <button
            type="button"
            onClick={() => setShowLogoutDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Logout
          </button>
        </div>
      </header>

      {/* Logout Confirmation Dialog — white theme */}
      {showLogoutDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowLogoutDialog(false)}
        >
          <div
            className="w-full max-w-sm mx-4 rounded-2xl border border-[#E5E5E5] bg-white px-6 py-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-500 flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">logout</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">Log out?</p>
                <p className="text-xs text-[#6B7280] mt-0.5">You will be redirected to the login page.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={() => setShowLogoutDialog(false)}
                className="rounded-lg border border-[#E5E5E5] px-4 py-2 text-[#374151] font-medium hover:bg-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 px-4 py-2 font-semibold text-white transition-colors"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;