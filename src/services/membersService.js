import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Fetch all members from Supabase
 * @returns {Promise<Array>} Array of member objects
 */
export const getMembers = async () => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured. Returning empty array.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMembers:', error);
    return [];
  }
};

/**
 * Fetch a single member by ID
 * @param {string} id - Member ID
 * @returns {Promise<Object|null>} Member object or null
 */
export const getMemberById = async (id) => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching member:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getMemberById:', error);
    return null;
  }
};

/**
 * Search members by name
 * @param {string} searchQuery - Search term
 * @returns {Promise<Array>} Array of matching members
 */
export const searchMembers = async (searchQuery) => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured. Returning empty array.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error searching members:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchMembers:', error);
    return [];
  }
};

/**
 * Filter members by role
 * @param {string} roleType - Role type (Captain, Lead Rider, Rider, etc.)
 * @returns {Promise<Array>} Array of filtered members
 */
export const getMembersByRole = async (roleType) => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured. Returning empty array.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('role_type', roleType)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error filtering members:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMembersByRole:', error);
    return [];
  }
};

