import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Fetch all events from Supabase
 * @returns {Promise<Array>} Array of event objects
 */
export const getEvents = async () => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured. Returning empty array.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getEvents:', error);
    return [];
  }
};

/**
 * Fetch upcoming events (events with date >= today)
 * @returns {Promise<Array>} Array of upcoming event objects
 */
export const getUpcomingEvents = async () => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured. Returning empty array.');
    return [];
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', today)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUpcomingEvents:', error);
    return [];
  }
};

/**
 * Fetch a single event by ID
 * @param {string} id - Event ID
 * @returns {Promise<Object|null>} Event object or null
 */
export const getEventById = async (id) => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getEventById:', error);
    return null;
  }
};

/**
 * Search events by title
 * @param {string} searchQuery - Search term
 * @returns {Promise<Array>} Array of matching events
 */
export const searchEvents = async (searchQuery) => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured. Returning empty array.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .ilike('title', `%${searchQuery}%`)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error searching events:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchEvents:', error);
    return [];
  }
};

/**
 * Create a new event
 * @param {Object} eventData - Event data object
 * @param {string} eventData.title - Event title
 * @param {string} eventData.event_date - Event date (YYYY-MM-DD)
 * @param {string} eventData.event_time - Event time (HH:MM format)
 * @param {string} eventData.location - Event location
 * @param {string} eventData.image_url - Event image URL (optional)
 * @param {string} eventData.description - Event description (optional)
 * @returns {Promise<Object>} Created event object
 */
export const createEvent = async (eventData) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        title: eventData.title,
        event_date: eventData.event_date,
        event_time: eventData.event_time || null,
        location: eventData.location,
        image_url: eventData.image_url || null,
        description: eventData.description || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createEvent:', error);
    throw error;
  }
};

/**
 * Update an existing event
 * @param {string} id - Event ID
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>} Updated event object
 */
export const updateEvent = async (id, eventData) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .update({
        title: eventData.title,
        event_date: eventData.event_date,
        event_time: eventData.event_time || null,
        location: eventData.location,
        image_url: eventData.image_url !== undefined ? eventData.image_url : null,
        description: eventData.description || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateEvent:', error);
    throw error;
  }
};

/**
 * Delete an event
 * @param {string} id - Event ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteEvent = async (id) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    throw error;
  }
};

