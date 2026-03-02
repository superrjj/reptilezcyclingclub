import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getPosts, createPost, updatePost, deletePost, searchPosts } from '../../../services/postsService';
import { uploadImage } from '../../../services/imageUploadService';
import AdminLayout from '../AdminLayout';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { useTabVisibility } from '../../../hooks/useTabVisibility';
import { usePageMeta } from '../../../hooks/usePageMeta';

const Posts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [draggingMediaId, setDraggingMediaId] = useState(null);
  const fileInputRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [authorProfiles, setAuthorProfiles] = useState({});

  usePageMeta('Admin Posts');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const [expandedAdminPosts, setExpandedAdminPosts] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Announcement',
    featured_image: '',
    media: [],
    status: 'Draft'
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getPosts();
      setPosts(data);
      fetchAuthorProfiles(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = async () => {
    if (searchQuery.trim()) {
      try {
        const data = await searchPosts(searchQuery);
        setPosts(data);
        fetchAuthorProfiles(data);
      } catch (error) {
        console.error('Error searching posts:', error);
      }
    } else {
      await fetchPosts();
    }
  };

  useEffect(() => { 
    fetchPosts(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchPostsData = async () => {
        try {
          const data = await searchPosts(searchQuery);
          setPosts(data);
          fetchAuthorProfiles(data);
        } catch (error) {
          console.error('Error searching posts:', error);
        }
      };
      searchPostsData();
    } else {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useTabVisibility(refreshPosts);

  const fetchAuthorProfiles = async (postsData) => {
    if (!isSupabaseConfigured || !supabase || !Array.isArray(postsData)) return;
    const uniqueIds = Array.from(new Set(postsData.map((post) => post.author_id).filter((id) => typeof id === 'string' && id.length > 0)));
    if (uniqueIds.length === 0) { setAuthorProfiles({}); return; }
    try {
      const { data, error } = await supabase.from('profiles').select('id, first_name, last_name').in('id', uniqueIds);
      if (error) { console.error('Error fetching author profiles:', error); return; }
      const map = {};
      data?.forEach((profile) => {
        const first = profile.first_name?.trim() || '';
        const last = profile.last_name?.trim() || '';
        const fullName = `${first}${last ? ` ${last}` : ''}`.trim();
        map[profile.id] = fullName || 'Admin';
      });
      setAuthorProfiles(map);
    } catch (err) {
      console.error('Unexpected error fetching author profiles:', err);
    }
  };

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleStatusToggle = (e) => { setFormData(prev => ({ ...prev, status: e.target.checked ? 'Published' : 'Draft' })); };
  const showToast = (type, message) => { setToast({ visible: true, type, message }); setTimeout(() => { setToast((prev) => ({ ...prev, visible: false })); }, 3000); };

  const makeMediaId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  const handleMediaFiles = async (files) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) { showToast('error', `${file.name} is not an image or video file`); return false; }
      const maxSize = isVideo ? 50 * 1024 * 1024 : 30 * 1024 * 1024;
      if (file.size > maxSize) { showToast('error', `${file.name} is too large. Max size: ${isVideo ? '50MB' : '30MB'}`); return false; }
      return true;
    });
    if (validFiles.length === 0) return;
    try {
      const newItems = await Promise.all(validFiles.map(async (file) => {
        try {
          const url = await readFileAsDataUrl(file);
          const type = file.type.startsWith('video/') ? 'video' : 'image';
          if (!url) return null;
          return { id: makeMediaId(), url, type, file, name: file.name };
        } catch (error) {
          console.error('Error reading file:', error);
          showToast('error', `Error reading ${file.name}. Please try again.`);
          return null;
        }
      }));
      setMediaItems(prev => [...prev, ...newItems.filter(Boolean)]);
    } catch (error) {
      console.error('Unexpected error preparing media previews:', error);
      showToast('error', 'Unable to add media. Please try again.');
    }
  };

  const handleMediaUpload = async (e) => { const files = Array.from(e.target.files); await handleMediaFiles(files); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = async (e) => { e.preventDefault(); e.stopPropagation(); const files = Array.from(e.dataTransfer.files); await handleMediaFiles(files); };

  const removeMediaById = (id) => {
    setMediaItems(prev => prev.filter((m) => m.id !== id));
  };

  const clearAllMedia = () => {
    setMediaItems([]);
    setFormData(prev => ({ ...prev, featured_image: '', media: [] }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const reorderMedia = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    setMediaItems((prev) => {
      const fromIndex = prev.findIndex((m) => m.id === fromId);
      const toIndex = prev.findIndex((m) => m.id === toId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const setAsCover = (id) => {
    setMediaItems((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx < 0) return prev;
      const item = prev[idx];
      if (item.type !== 'image') return prev;
      const next = [...prev];
      next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const uploadPromises = mediaItems.map(async (item) => {
        if (!item) return null;
        if (!item.file) {
          return { url: item.url, type: item.type };
        }
        try {
          const url = await uploadImage(item.file, 'posts');
          return { url, type: item.type };
        } catch (uploadError) {
          console.error('Error uploading media, using base64 fallback:', uploadError);
          return { url: item.url, type: item.type };
        }
      });
      const mediaArray = (await Promise.all(uploadPromises)).filter(Boolean);
      const firstImage = mediaArray.find(m => m.type === 'image');
      const featuredImage = firstImage ? firstImage.url : '';
      const authorId = user?.id && user.id !== 'admin' ? user.id : null;
      const postData = { ...formData, featured_image: featuredImage, media: mediaArray, author_id: authorId };
      if (editingPost) {
        await updatePost(editingPost.id, { ...postData, updated_at: new Date().toISOString() });
      } else {
        await createPost(postData);
      }
      resetForm();
      setShowModal(false);
      fetchPosts();
      showToast('success', editingPost ? 'Post updated successfully.' : 'Post created successfully.');
    } catch (error) {
      console.error('Error saving post:', error);
      const errorMessage = error?.message || 'Error saving post. Please try again.';
      showToast('error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    const media = post.media || (post.featured_image ? [{ url: post.featured_image, type: 'image' }] : []);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      category: post.category || 'Announcement',
      featured_image: post.featured_image || '',
      media,
      status: post.status || 'Draft'
    });
    let items = (Array.isArray(media) ? media : [])
      .map((m, idx) => ({
        id: `existing-${post.id}-${idx}`,
        url: m.url,
        type: m.type || 'image',
      }))
      .filter((m) => m.url);
    if (post.featured_image) {
      const matchIndex = items.findIndex((m) => m.type === 'image' && m.url === post.featured_image);
      if (matchIndex > 0) {
        const next = [...items];
        const [matched] = next.splice(matchIndex, 1);
        next.unshift(matched);
        items = next;
      } else if (matchIndex === -1) {
        items.unshift({ id: `existing-cover-${post.id}`, url: post.featured_image, type: 'image' });
      }
    }
    setMediaItems(items);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      fetchPosts();
      showToast('success', 'Post deleted successfully.');
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('error', 'Error deleting post. Please try again.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'Announcement', featured_image: '', media: [], status: 'Draft' });
    setEditingPost(null);
    setMediaItems([]);
    if (fileInputRef.current) { fileInputRef.current.value = ''; }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const datePart = date.toLocaleDateString('en-US', { timeZone: 'Asia/Manila', year: 'numeric', month: 'long', day: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    return `${datePart} at ${timePart}`;
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Helpers to mirror public PostsSection card behavior
  const categoryThemes = {
    Announcement: {
      badge: 'bg-reptilez-green-100 text-reptilez-green-700 border border-reptilez-green-300',
    },
    'Race Reports': {
      badge: 'bg-red-100 text-red-700 border border-red-300',
    },
    default: {
      badge: 'bg-reptilez-green-100 text-reptilez-green-700 border border-reptilez-green-300',
    },
  };

  const getCategoryTheme = (category) => {
    if (!category) return categoryThemes.default;
    return categoryThemes[category] || categoryThemes.default;
  };

  const getPostMedia = (post) => {
    if (post.media && Array.isArray(post.media) && post.media.length > 0) {
      return post.media;
    }
    if (post.featured_image) {
      return [{ url: post.featured_image, type: 'image' }];
    }
    return [];
  };

  const getCoverImage = (post) => {
    const media = getPostMedia(post);
    const firstImage = media.find(m => m.type === 'image');
    return firstImage ? firstImage.url : null;
  };

  const MAX_PREVIEW = 120;

  return (
    <AdminLayout>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <main className="relative flex-1 overflow-y-auto bg-white p-4 md:p-8">
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-background-dark/95 px-6 py-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.85)]">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-red-500/15 border border-red-400/60 text-red-400">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Delete post?</p>
                  <p className="text-xs text-white/60">This action cannot be undone.</p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3 text-sm">
                <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-white/20 px-4 py-2 text-white/80 hover:bg-white/5">Cancel</button>
                <button type="button" onClick={() => handleDelete(deleteTarget.id)} className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600">
                  <span className="material-symbols-outlined text-base">delete</span>Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-xl sm:rounded-2xl border border-primary/30 bg-gray-900 text-white shadow-[0_0_60px_rgba(34,197,94,0.3)] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-4 sm:my-8 scrollbar-hide">
              <div className="sticky top-0 bg-gray-900 border-b border-primary/20 p-4 sm:p-6 flex items-start sm:items-center justify-between z-10 gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white break-words">{editingPost ? 'Update Post' : 'Create New Post'}</h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">{editingPost ? 'Editing announcement' : 'Draft new announcement'}</p>
                </div>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 flex-shrink-0" aria-label="Close dialog">
                  <span className="material-symbols-outlined text-lg sm:text-xl">close</span>
                </button>
              </div>
              <form className="p-4 sm:p-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">Post Title</label>
                  <input className="w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white" name="title" placeholder="Annual Club Championship" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">Content</label>
                  <textarea className="w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white" name="content" placeholder="Write your post..." rows="6" value={formData.content} onChange={handleInputChange} required></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Media</label>
                  {mediaItems.length > 0 ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-gray-700 bg-gray-800/40 px-3 py-2 text-xs text-gray-300">
                        Drag/long-press to reorder. The <span className="font-bold text-white">first image</span> will be the card background (cover).
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {mediaItems.map((item) => {
                          const coverId = mediaItems.find(m => m.type === 'image')?.id;
                          const isCover = item.type === 'image' && item.id === coverId;
                          return (
                            <div
                              key={item.id}
                              className="relative group"
                              draggable
                              onDragStart={(e) => {
                                setDraggingMediaId(item.id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                reorderMedia(draggingMediaId, item.id);
                                setDraggingMediaId(null);
                              }}
                              onDragEnd={() => setDraggingMediaId(null)}
                            >
                              {item.type === 'video'
                                ? <video src={item.url} className="h-32 w-full object-cover rounded-lg border border-gray-700" />
                                : <img src={item.url} alt={item.name || 'Media preview'} className="h-32 w-full object-cover rounded-lg border border-gray-700" />
                              }

                              {/* Drag handle */}
                              <div className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-1 text-white text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                <span className="material-symbols-outlined text-sm">drag_indicator</span>
                                Drag
                              </div>

                              {/* Cover badge */}
                              {isCover && (
                                <div className="absolute left-2 bottom-2 rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-bold text-gray-900">
                                  Cover
                                </div>
                              )}

                              {/* Actions */}
                              <div className="absolute right-2 top-2 flex flex-col gap-2">
                                {item.type === 'image' && !isCover && (
                                  <button
                                    type="button"
                                    onClick={() => setAsCover(item.id)}
                                    className="rounded-full bg-white/90 p-1.5 text-gray-900 opacity-0 group-hover:opacity-100 hover:bg-white"
                                    aria-label="Set as cover"
                                    title="Set as cover"
                                  >
                                    <span className="material-symbols-outlined text-sm">photo</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeMediaById(item.id)}
                                  className="rounded-full bg-red-500 p-1.5 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600"
                                  aria-label="Remove media"
                                  title="Remove"
                                >
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                              </div>
                          </div>
                          );
                        })}
                      </div>
                      <button type="button" onClick={clearAllMedia} className="text-sm text-red-400">Clear all</button>
                    </div>
                  ) : (
                    <div className="flex justify-center px-6 pt-8 pb-8 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:border-primary bg-gray-800/50" onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDrop={handleDrop}>
                      <div className="text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-500">upload_file</span>
                        <p className="text-sm text-gray-400 mt-2">Drag & drop or tap</p>
                        <p className="text-xs text-gray-500 mt-1">Max 30MB (images) / 50MB (videos)</p>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} className="hidden" type="file" accept="image/*,video/*" multiple onChange={handleMediaUpload} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">Category</label>
                    <select
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="Announcement">Announcement</option>
                      <option value="Race Reports">Race Reports</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">Status</label>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs sm:text-sm text-gray-400">Draft</span>
                      <label className="cursor-pointer">
                        <input className="sr-only" type="checkbox" checked={formData.status === 'Published'} onChange={handleStatusToggle} />
                        <div className={`w-14 h-7 rounded-full ${formData.status === 'Published' ? 'bg-primary' : 'bg-gray-700'}`}>
                          <div className="w-5 h-5 bg-white rounded-full mt-1 transition-transform" style={{ transform: formData.status === 'Published' ? 'translateX(1.75rem)' : 'translateX(0.25rem)' }}></div>
                        </div>
                      </label>
                      <span className="text-sm text-primary">Published</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 bg-gray-800 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-700 border border-gray-700 text-sm sm:text-base">Cancel</button>
                  <button className="flex-1 bg-primary font-bold py-2.5 sm:py-3 rounded-lg hover:bg-green-700 shadow-lg shadow-primary/30 disabled:opacity-60 text-sm sm:text-base" type="submit" disabled={uploading}>{uploading ? 'Saving...' : editingPost ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {toast.visible && (
          <div className={`fixed right-4 top-20 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'border-green-400/60 bg-green-500/10 text-green-200' : 'border-red-400/60 bg-red-500/10 text-red-200'}`}>
            <span className="material-symbols-outlined text-xl">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
            <p>{toast.message}</p>
          </div>
        )}

        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Posts Management</h1>
              <p className="text-gray-500 mt-1">Create and manage announcements and race reports</p>
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined">add</span>Create Post
            </button>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
            <input
              className="w-full pl-12 pr-4 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary py-3 text-gray-900 placeholder-gray-500"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="bg-white border border-reptilez-green-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="h-52 shimmer-bg" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-20 rounded-full shimmer-bg" />
                    <div className="h-5 w-3/4 rounded-full shimmer-bg" />
                    <div className="h-3 w-full rounded-full shimmer-bg" />
                    <div className="h-3 w-5/6 rounded-full shimmer-bg" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-xl border border-reptilez-green-100">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-4xl">post_add</span>
              </div>
              <p className="text-gray-700 text-lg font-semibold">No posts yet</p>
              <p className="text-gray-500 text-sm mt-1">Create your first post</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                const coverImage = getCoverImage(post);
                const media = getPostMedia(post);
                const mediaImageCount = media.filter(m => m.type === 'image').length;
                const content = post.content || '';
                const isExpanded = expandedAdminPosts[post.id];
                const truncated = content.length > MAX_PREVIEW && !isExpanded
                  ? `${content.substring(0, MAX_PREVIEW)}...`
                  : content;

                return (
                  <article
                    key={post.id}
                    className="bg-white border border-reptilez-green-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-reptilez-green-400 transition-all duration-300 flex flex-col"
                  >
                    {/* Cover Image + Category */}
                    <div className="relative h-52 bg-gradient-to-br from-reptilez-green-50 to-reptilez-green-100 overflow-hidden">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-reptilez-green-300">article</span>
                        </div>
                      )}
                      {mediaImageCount > 1 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-sm">
                          <span className="material-symbols-outlined text-sm">photo_library</span>
                          {mediaImageCount}
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 flex gap-2 items-center">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getCategoryTheme(post.category).badge} backdrop-blur-sm`}
                        >
                          {post.category || 'Announcement'}
                        </span>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-white/90 text-gray-700 border border-gray-200">
                          {post.status || 'Draft'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex flex-col flex-1 gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex items-center justify-center rounded-full bg-reptilez-green-100 text-reptilez-green-700 size-8 text-xs font-bold flex-shrink-0">
                            {((authorProfiles[post.author_id] || 'A') || 'A').charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {post.author_id ? (authorProfiles[post.author_id] || 'Admin') : 'Admin'}
                            </p>
                            <p className="text-[11px] text-gray-500">{formatDate(post.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-gray-900 text-lg font-bold leading-snug line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line flex-1">
                        {truncated}
                      </p>

                      {content.length > MAX_PREVIEW && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedAdminPosts(prev => ({ ...prev, [post.id]: !prev[post.id] }))
                          }
                          className="mt-1 text-xs font-semibold text-reptilez-green-600 hover:text-reptilez-green-700 self-start"
                        >
                          {isExpanded ? 'See less' : 'See more'}
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-reptilez-green-100 px-4 py-3 flex items-center justify-between bg-reptilez-green-50/40">
                      <span className="text-[11px] text-gray-600">
                        Last updated: {formatDate(post.updated_at || post.created_at)}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(post)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-reptilez-green-700 bg-white hover:bg-reptilez-green-600 hover:text-white border border-reptilez-green-200 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-white hover:bg-red-500 hover:text-white border border-red-200 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
};

export default Posts;