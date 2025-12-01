import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Fetch all posts from Supabase
 * @returns {Promise<Array>} Array of post objects
 */
export const getPosts = async () => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured. Returning empty array.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPosts:', error);
    return [];
  }
};

/**
 * Fetch a single post by ID
 * @param {string} id - Post ID
 * @returns {Promise<Object|null>} Post object or null
 */
export const getPostById = async (id) => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getPostById:', error);
    return null;
  }
};

/**
 * Search posts by title
 * @param {string} searchQuery - Search term
 * @returns {Promise<Array>} Array of matching posts
 */
export const searchPosts = async (searchQuery) => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured. Returning empty array.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .ilike('title', `%${searchQuery}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching posts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchPosts:', error);
    return [];
  }
};

/**
 * Create a new post
 * @param {Object} postData - Post data (title, content, category, featured_image, status)
 * @returns {Promise<Object>} Created post object
 */
export const createPost = async (postData) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createPost:', error);
    throw error;
  }
};

/**
 * Update an existing post
 * @param {string} id - Post ID
 * @param {Object} postData - Updated post data
 * @returns {Promise<Object>} Updated post object
 */
export const updatePost = async (id, postData) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updatePost:', error);
    throw error;
  }
};

/**
 * Delete a post
 * @param {string} id - Post ID
 * @returns {Promise<boolean>} True if successful
 */
export const deletePost = async (id) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePost:', error);
    throw error;
  }
};
