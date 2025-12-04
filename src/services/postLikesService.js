import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ensureClient = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }
};

export const fetchPostLikeSummary = async (deviceId) => {
  ensureClient();
  const { data, error } = await supabase.from('post_likes').select('post_id, device_id');

  if (error) {
    console.error('Error fetching like summary:', error);
    throw error;
  }

  const counts = {};
  const likedPostIds = [];

  (data || []).forEach((row) => {
    counts[row.post_id] = (counts[row.post_id] || 0) + 1;
    if (deviceId && row.device_id === deviceId) {
      likedPostIds.push(row.post_id);
    }
  });

  return { counts, likedPostIds };
};

export const upsertPostLike = async (postId, fingerprint) => {
  ensureClient();
  const payload = {
    post_id: postId,
    device_id: fingerprint.id,
    device_model: fingerprint.model,
    device_location: fingerprint.location,
    liked_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('post_likes')
    .upsert(payload, { onConflict: 'post_id,device_id' })
    .select('post_id')
    .single();

  if (error) {
    console.error('Error upserting like:', error);
    throw error;
  }

  return data;
};

export const removePostLike = async (postId, deviceId) => {
  ensureClient();
  const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('device_id', deviceId);

  if (error) {
    console.error('Error removing like:', error);
    throw error;
  }

  return true;
};

