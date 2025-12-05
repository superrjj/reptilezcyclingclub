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

/**
 * Create a new member
 * @param {Object} memberData - Member data object
 * @param {string} memberData.name - Member full name
 * @param {string} memberData.role - Member role (display name)
 * @param {string} memberData.role_type - Member role type (Founder, Rider, Captain, Utility)
 * @param {string} memberData.image_url - Member image URL (optional)
 * @param {string} memberData.description - Member description (optional)
 * @param {string} memberData.bio - Member bio (optional)
 * @returns {Promise<Object>} Created member object
 */
export const createMember = async (memberData) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const { data, error } = await supabase
      .from('members')
      .insert([{
        name: memberData.name,
        role: memberData.role || memberData.role_type,
        role_type: memberData.role_type,
        image_url: memberData.image_url || null,
        description: memberData.description || null,
        bio: memberData.bio || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating member:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createMember:', error);
    throw error;
  }
};

/**
 * Update an existing member
 * @param {string} id - Member ID
 * @param {Object} memberData - Updated member data
 * @returns {Promise<Object>} Updated member object
 */
export const updateMember = async (id, memberData) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const { data, error } = await supabase
      .from('members')
      .update({
        name: memberData.name,
        role: memberData.role || memberData.role_type,
        role_type: memberData.role_type,
        image_url: memberData.image_url !== undefined ? memberData.image_url : null,
        description: memberData.description || null,
        bio: memberData.bio || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating member:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateMember:', error);
    throw error;
  }
};

/**
 * Delete a member
 * @param {string} id - Member ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteMember = async (id) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting member:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMember:', error);
    throw error;
  }
};

