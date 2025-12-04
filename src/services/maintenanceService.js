import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Fetch maintenance images by type
 * @param {string} type - 'Hero' or 'Gallery'
 * @returns {Promise<Array>} Array of maintenance objects
 */
export const getMaintenanceByType = async (type) => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured. Returning empty array.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*')
      .eq('type', type)
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching maintenance images:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMaintenanceByType:', error);
    return [];
  }
};

/**
 * Create a new maintenance entry
 * @param {Object} maintenanceData - Maintenance data (type, image_url)
 * @returns {Promise<Object>} Created maintenance object
 */
export const createMaintenance = async (maintenanceData) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const { data, error } = await supabase
      .from('maintenance')
      .insert([maintenanceData])
      .select()
      .single();

    if (error) {
      console.error('Error creating maintenance entry:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createMaintenance:', error);
    throw error;
  }
};

/**
 * Delete a maintenance entry
 * @param {string} id - Maintenance ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteMaintenance = async (id) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const { error } = await supabase
      .from('maintenance')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting maintenance entry:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMaintenance:', error);
    throw error;
  }
};

