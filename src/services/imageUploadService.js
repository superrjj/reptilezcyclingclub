import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { compressImage } from '../utils/compressImage';

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} folder - Folder name in storage (e.g., 'posts')
 * @returns {Promise<string>} Public URL of uploaded image
 */
export const uploadImage = async (file, folder) => {
  // Compress before upload (skips videos/GIFs automatically)
  const fileToUpload = file.type.startsWith('image/')
    ? await compressImage(file)
    : file;

  try {
    // Generate unique filename - sanitize original filename and remove special characters
    const fileExt = fileToUpload.name.split('.').pop();
    const sanitizedName = fileToUpload.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars with hyphens
      .toLowerCase()
      .substring(0, 50); // Limit length
    const fileName = `${sanitizedName}_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};

/**
 * Delete image from Supabase Storage
 * @param {string} imageUrl - Public URL of the image to delete
 * @param {string} folder - Folder name in storage
 * @returns {Promise<boolean>} True if successful
 */
export const deleteImage = async (imageUrl, folder = 'posts') => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
};