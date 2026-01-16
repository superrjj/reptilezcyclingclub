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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
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
    category: 'Announcements',
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
    setAuthorLoading(true);
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
    } finally {
      setAuthorLoading(false);
    }
  };

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleStatusToggle = (e) => { setFormData(prev => ({ ...prev, status: e.target.checked ? 'Published' : 'Draft' })); };
  const showToast = (type, message) => { setToast({ visible: true, type, message }); setTimeout(() => { setToast((prev) => ({ ...prev, visible: false })); }, 3000); };

  const handleMediaFiles = (files) => {
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
    setSelectedFiles(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        showToast('error', `Error reading ${file.name}. Please try again.`);
      };
      reader.onloadend = () => {
        if (reader.result) {
          const type = file.type.startsWith('video/') ? 'video' : 'image';
          setMediaPreviews(prev => [...prev, { url: reader.result, type, file }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMediaUpload = async (e) => { const files = Array.from(e.target.files); handleMediaFiles(files); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); const files = Array.from(e.dataTransfer.files); handleMediaFiles(files); };
  const removeMedia = (index) => { setSelectedFiles(prev => prev.filter((_, i) => i !== index)); setMediaPreviews(prev => prev.filter((_, i) => i !== index)); };
  const clearAllMedia = () => { setSelectedFiles([]); setMediaPreviews([]); setFormData(prev => ({ ...prev, featured_image: '', media: [] })); if (fileInputRef.current) { fileInputRef.current.value = ''; } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let mediaArray = formData.media || [];
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          try {
            const url = await uploadImage(file, 'posts');
            const type = file.type.startsWith('video/') ? 'video' : 'image';
            return { url, type };
          } catch (uploadError) {
            console.error('Error uploading media, using base64 fallback:', uploadError);
            const preview = mediaPreviews.find(p => p.file === file);
            if (preview) {
              const type = file.type.startsWith('video/') ? 'video' : 'image';
              return { url: preview.url, type };
            }
            return null;
          }
        });
        const uploadedMedia = await Promise.all(uploadPromises);
        mediaArray = [...mediaArray, ...uploadedMedia.filter(Boolean)];
      }
      const firstImage = mediaArray.find(m => m.type === 'image');
      const featuredImage = firstImage ? firstImage.url : (formData.featured_image || '');
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
    setFormData({ title: post.title || '', content: post.content || '', category: post.category || 'Announcements', featured_image: post.featured_image || '', media: media, status: post.status || 'Draft' });
    setMediaPreviews(media.map(m => ({ url: m.url, type: m.type })));
    setSelectedFiles([]);
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
    setFormData({ title: '', content: '', category: 'Announcements', featured_image: '', media: [], status: 'Draft' });
    setEditingPost(null);
    setSelectedFiles([]);
    setMediaPreviews([]);
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
      <main className="relative flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8">
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
                  {(mediaPreviews.length > 0 || (formData.media && formData.media.length > 0)) ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        {(mediaPreviews.length > 0 ? mediaPreviews : formData.media).map((preview, index) => (
                          <div key={index} className="relative group">
                            {preview.type === 'video' ? <video src={preview.url} className="h-32 w-full object-cover rounded-lg border border-gray-700" /> : <img src={preview.url} alt="Media preview" className="h-32 w-full object-cover rounded-lg border border-gray-700" />}
                            <button type="button" onClick={() => removeMedia(index)} className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-sm">close</span></button>
                          </div>
                        ))}
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
                    <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white" name="category" value={formData.category} onChange={handleInputChange}>
                      <option>Announcements</option>
                      <option>Events</option>
                      <option>News</option>
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

        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-white">Posts Management</h1>
              <p className="text-gray-400 mt-1">Create and manage announcements</p>
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined">add</span>Create Post
            </button>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
            <input className="w-full pl-12 pr-4 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary py-3 text-white placeholder-gray-400" placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="size-12 rounded-full shimmer-bg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded-full shimmer-bg" />
                      <div className="h-3 w-24 rounded-full shimmer-bg" />
                    </div>
                  </div>
                  <div className="h-48 w-full rounded-lg shimmer-bg" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><span className="material-symbols-outlined text-primary text-4xl">post_add</span></div>
              <p className="text-gray-400 text-lg font-semibold">No posts yet</p>
              <p className="text-gray-500 text-sm mt-1">Create your first post</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article key={post.id} className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden hover:border-primary/30">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        <img className="h-12 w-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAXt23xlpLChR-wdeFdGq9v8UFYq9UyGOM3nv5SOGrJzRXtbjWheLP6RwBXXYSp79k3G25giEzhJYchikYxDeIgCNe_JFD0XZIqcmMbhWTKXtr8AGIWo_jgfyL_zG6-lWwZFTNY60dX8TB8k2e2t1yiXtZK5krAJiOtGYc9Ot85xhj5UcRa7v9HElNACJkxNaZmPhr5T6G0FoUvs3_3rgsp9ARhcz153hSZG_KmsyFKbahYGZAUqfUvctYXnap2ZbRQcK7KqdddvE" alt="Author" />
                        <div>
                          <p className="font-semibold text-white">{post.author_id ? (authorProfiles[post.author_id] || 'Admin') : 'Admin'}</p>
                          <p className="text-sm text-gray-400">{formatDate(post.created_at)}</p>
                        </div>
                      </div>
                      <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full">{post.status}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                    <p className="whitespace-pre-line text-gray-300">
                      {(() => {
                        const content = post.content || '';
                        const isExpanded = expandedAdminPosts[post.id];
                        if (content.length > 160 && !isExpanded) return `${content.substring(0, 160)}...`;
                        return content;
                      })()}
                    </p>
                    {(post.content || '').length > 160 && (
                      <button className="mt-1 text-sm font-semibold text-primary hover:text-green-700" onClick={() => setExpandedAdminPosts(prev => ({ ...prev, [post.id]: !prev[post.id] }))}>
                        {expandedAdminPosts[post.id] ? 'See less' : 'See more'}
                      </button>
                    )}
                  </div>
                  {(() => {
                    const media = post.media?.length > 0 ? post.media : (post.featured_image ? [{ url: post.featured_image, type: 'image' }] : []);
                    if (media.length === 0) return null;
                    if (media.length === 1) {
                      return media[0].type === 'video' ? <video className="w-full h-64 object-cover" src={media[0].url} controls /> : <img className="w-full h-64 object-cover" src={media[0].url} alt="Post media" />;
                    }
                    return (
                      <div className="grid grid-cols-2 gap-1 bg-gray-800 p-1">
                        {media.slice(0, 4).map((item, i) => (
                          <div key={i} className="relative">
                            {item.type === 'video' ? <video className="w-full h-32 object-cover" src={item.url} controls /> : <img className="w-full h-32 object-cover" src={item.url} alt="Post media" />}
                            {media.length > 4 && i === 3 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white font-bold">+{media.length - 4}</span></div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="p-6 flex justify-between border-t border-gray-800">
                    <button onClick={() => handleEdit(post)} className="flex items-center gap-2 text-primary hover:text-green-700"><span className="material-symbols-outlined text-base">edit</span>Edit</button>
                    <button onClick={() => setDeleteTarget(post)} className="flex items-center gap-2 text-red-500 hover:text-red-600"><span className="material-symbols-outlined text-base">delete</span>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
};

export default Posts;