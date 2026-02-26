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
    // Only use Supabase if configured
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setUser(null);
        setLoading(false);
        return;
      }
      if (session?.user) {
        // Check if user is admin
        const isAdmin = session.user.email === 'admin@reptilez.com';
        setUser({ 
          ...session.user, 
          isAdmin 
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Error in getSession:', error);
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Check if user is admin
        const isAdmin = session.user.email === 'admin@reptilez.com';
        setUser({ 
          ...session.user, 
          isAdmin 
        });
      } else {
        setUser(null);
      }
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
