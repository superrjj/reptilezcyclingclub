-- Migration: Add media column to posts table for multiple images/videos support
-- This allows storing an array of media objects: [{url: string, type: 'image'|'video'}]

-- Add media column as JSONB to store array of media objects
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb;

-- Migrate existing featured_image to media array format
-- If featured_image exists and media is empty, convert featured_image to media format
UPDATE posts 
SET media = CASE 
  WHEN featured_image IS NOT NULL AND featured_image != '' AND (media IS NULL OR media = '[]'::jsonb)
  THEN jsonb_build_array(jsonb_build_object('url', featured_image, 'type', 'image'))
  ELSE COALESCE(media, '[]'::jsonb)
END
WHERE featured_image IS NOT NULL AND featured_image != '';

-- Note: featured_image column is kept for backward compatibility
-- You can remove it later if desired with: ALTER TABLE posts DROP COLUMN featured_image;

