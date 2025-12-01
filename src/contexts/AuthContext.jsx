import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (adminLoggedIn) {
      setUser({ 
        id: 'admin',
        email: localStorage.getItem('adminUsername') || 'adminrcc',
        isAdmin: true 
      });
      setLoading(false);
      return;
    }

    // Only use Supabase if configured
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    // If Supabase is not configured, return error
    if (!isSupabaseConfigured || !supabase) {
      return { 
        data: null, 
        error: { message: 'Authentication service not configured' } 
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        data: null, 
        error: { message: 'Authentication service not configured' } 
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    // Clear admin session
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    setUser(null);

    // If Supabase is configured, sign out from there too
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      return { error };
    }

    return { error: null };
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

