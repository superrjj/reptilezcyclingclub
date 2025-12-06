import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getPosts, createPost, updatePost, deletePost, searchPosts } from '../../../services/postsService';
import { uploadImage } from '../../../services/imageUploadService';
import AdminLayout from '../AdminLayout';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

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
  const [authorLoading, setAuthorLoading] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    type: 'success', // 'success' | 'error'
    message: '',
  });
  const [expandedAdminPosts, setExpandedAdminPosts] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Announcements',
    featured_image: '', // Keep for backward compatibility
    media: [], // New: array of {url, type}
    status: 'Draft'
  });

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Fetch posts from Supabase
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

  // Search posts
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
  }, [searchQuery]);

  const fetchAuthorProfiles = async (postsData) => {
    if (!isSupabaseConfigured || !supabase || !Array.isArray(postsData)) return;
    setAuthorLoading(true);
    const uniqueIds = Array.from(
      new Set(
        postsData
          .map((post) => post.author_id)
          .filter((id) => typeof id === 'string' && id.length > 0)
      )
    );

    if (uniqueIds.length === 0) {
      setAuthorProfiles({});
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', uniqueIds);

      if (error) {
        console.error('Error fetching author profiles:', error);
        return;
      }

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusToggle = (e) => {
    setFormData(prev => ({
      ...prev,
      status: e.target.checked ? 'Published' : 'Draft'
    }));
  };

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleMediaFiles = (files) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      // Validate file type (images or videos)
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        showToast('error', `${file.name} is not an image or video file`);
        return false;
      }

      // Validate file size (max 50MB for videos, 30MB for images)
      const maxSize = isVideo ? 50 * 1024 * 1024 : 30 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast('error', `${file.name} is too large. Max size: ${isVideo ? '50MB' : '30MB'}`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Add to selected files
    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        setMediaPreviews(prev => [...prev, {
          url: reader.result,
          type,
          file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    handleMediaFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    handleMediaFiles(files);
  };

  const removeMedia = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllMedia = () => {
    setSelectedFiles([]);
    setMediaPreviews([]);
    setFormData(prev => ({
      ...prev,
      featured_image: '',
      media: []
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setUploading(true);
    
    try {
      let mediaArray = formData.media || [];
      
      // Upload new media files if any
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          try {
            const url = await uploadImage(file, 'posts');
            const type = file.type.startsWith('video/') ? 'video' : 'image';
            return { url, type };
          } catch (uploadError) {
            console.error('Error uploading media, using base64 fallback:', uploadError);
            // Fallback to base64 if upload fails
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

      // For backward compatibility, set featured_image to first image if exists
      const firstImage = mediaArray.find(m => m.type === 'image');
      const featuredImage = firstImage ? firstImage.url : (formData.featured_image || '');

      // Only set author_id if it's a valid UUID (not 'admin' string)
      const authorId = user?.id && user.id !== 'admin' ? user.id : null;

      const postData = {
        ...formData,
        featured_image: featuredImage, // Keep for backward compatibility
        media: mediaArray,
        author_id: authorId
      };

      if (editingPost) {
        // Update existing post
        await updatePost(editingPost.id, {
          ...postData,
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new post
        await createPost(postData);
      }
      
      // Reset form and refresh posts
      resetForm();
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
      category: post.category || 'Announcements',
      featured_image: post.featured_image || '',
      media: media,
      status: post.status || 'Draft'
    });
    setMediaPreviews(media.map(m => ({ url: m.url, type: m.type })));
    setSelectedFiles([]);
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
    setFormData({
      title: '',
      content: '',
      category: 'Announcements',
      featured_image: '',
      media: [],
      status: 'Draft'
    });
    setEditingPost(null);
    setSelectedFiles([]);
    setMediaPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const datePart = date.toLocaleDateString('en-US', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timePart = date
      .toLocaleTimeString('en-US', {
        timeZone: 'Asia/Manila',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .toLowerCase();
    return `${datePart} at ${timePart}`;
  };

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <AdminLayout>
      <main className="relative flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8">
        {/* Delete Confirmation Dialog */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-background-dark/95 px-6 py-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.85)]">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-red-500/15 border border-red-400/60 text-red-400">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Delete post?</p>
                  <p className="text-xs text-white/60">
                    This action cannot be undone. The post will be permanently removed.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-white/80 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteTarget.id)}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {toast.visible && (
          <div
            className={`fixed right-4 md:right-6 top-20 z-50 flex items-center gap-3 rounded-lg border px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold shadow-lg ${
              toast.type === 'success'
                ? 'border-green-400/60 bg-green-500/10 text-green-700 dark:text-green-200'
                : 'border-red-400/60 bg-red-500/10 text-red-700 dark:text-red-200'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p>{toast.message}</p>
          </div>
        )}
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6 px-4 md:px-6">
          
          <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
            {/* Composer */}
            <section className="lg:col-span-1 space-y-4 md:space-y-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-4 md:p-6">
              <div>
                <p className="text-sm font-medium text-primary mb-1">POST BUILDER</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {editingPost ? 'Update Post' : 'Create New Post'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {editingPost ? 'Editing existing announcement' : 'Draft a new announcement for the club.'}
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="post-title">Post Title</label>
                  <input
                    className="w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2"
                    id="post-title"
                    name="title"
                    placeholder="e.g., Annual Club Championship"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="post-content">Content</label>
                  <textarea
                    className="w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2"
                    id="post-content"
                    name="content"
                    placeholder="Write your post content here..."
                    rows="4"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Media (Images & Videos)
                  </label>
                  {(mediaPreviews.length > 0 || (editingPost && formData.media && formData.media.length > 0)) ? (
                    <div className="mt-1 space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(mediaPreviews.length > 0 ? mediaPreviews : (formData.media || [])).map((preview, index) => (
                          <div key={index} className="relative group">
                            {preview.type === 'video' ? (
                              <video
                                src={preview.url}
                                className="h-32 w-full object-cover rounded-md border border-gray-300 dark:border-gray-600"
                                controls={false}
                              />
                            ) : (
                              <img
                                src={preview.url}
                                alt={`Preview ${index + 1}`}
                                className="h-32 w-full object-cover rounded-md border border-gray-300 dark:border-gray-600"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeMedia(index)}
                              className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              {preview.type === 'video' ? 'Video' : 'Image'}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={clearAllMedia}
                        className="text-sm text-red-500 hover:text-red-600"
                      >
                        Clear all media
                      </button>
                    </div>
                  ) : (
                    <div
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-1 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500">upload_file</span>
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <p>Drag & drop or tap to upload</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Images/Videos, max 30MB (images) / 50MB (videos)</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    id="media-upload"
                    name="media"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaUpload}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="category">Category</label>
                    <select
                      className="w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option>Announcements</option>
                      <option>Events</option>
                      <option>News</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Draft</span>
                      <label className="flex items-center cursor-pointer" htmlFor="status-toggle">
                        <div className="relative">
                          <input
                            className="sr-only"
                            id="status-toggle"
                            type="checkbox"
                            checked={formData.status === 'Published'}
                            onChange={handleStatusToggle}
                          />
                          <div className={`block w-12 h-6 rounded-full transition-colors ${formData.status === 'Published' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                          <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform" style={{ transform: formData.status === 'Published' ? 'translateX(1.5rem)' : 'translateX(0)' }}></div>
                        </div>
                      </label>
                      <span className="text-sm font-medium text-primary">Published</span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={uploading}
                >
                  {uploading ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </form>
            </section>

            {/* Posts List */}
            <section className="lg:col-span-2 space-y-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Existing Posts</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Review and manage announcements in one place.</p>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl">search</span>
                  <input
                    className="w-full pl-10 pr-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder="Filter posts by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="space-y-4 py-2">
                  {[1, 2, 3].map((skeleton) => (
                    <div
                      key={skeleton}
                      className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-4 space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full shimmer-bg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-32 rounded-full shimmer-bg" />
                          <div className="h-2 w-24 rounded-full shimmer-bg" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-40 rounded-full shimmer-bg" />
                        <div className="h-2 w-full rounded-full shimmer-bg" />
                        <div className="h-2 w-5/6 rounded-full shimmer-bg" />
                      </div>
                      <div className="h-40 w-full rounded-md shimmer-bg" />
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="py-10 text-center text-gray-500 dark:text-gray-400">No posts found. Create your first post!</div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <img
                              alt="Profile picture"
                              className="h-12 w-12 rounded-full object-cover"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAXt23xlpLChR-wdeFdGq9v8UFYq9UyGOM3nv5SOGrJzRXtbjWheLP6RwBXXYSp79k3G25giEzhJYchikYxDeIgCNe_JFD0XZIqcmMbhWTKXtr8AGIWo_jgfyL_zG6-lWwZFTNY60dX8TB8k2e2t1yiXtZK5krAJiOtGYc9Ot85xhj5UcRa7v9HElNACJkxNaZmPhr5T6G0FoUvs3_3rgsp9ARhcz153hSZG_KmsyFKbahYGZAUqfUvctYXnap2ZbRQcK7KqdddvE"
                            />
                            <div>
                              {post.author_id ? (
                                authorLoading && !authorProfiles[post.author_id] ? (
                                  <div className="h-3 w-24 rounded-full shimmer-bg" />
                                ) : (
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {authorProfiles[post.author_id] || 'Admin'}
                                  </p>
                                )
                              ) : (
                                <p className="font-semibold text-gray-900 dark:text-white">Admin</p>
                              )}
                              <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.created_at)}</p>
                            </div>
                          </div>
                          <span className="bg-primary/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                            {post.status}
                          </span>
                        </div>

                        <div className="mt-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{post.title}</h3>
                          <p className="mt-2 whitespace-pre-line text-gray-600 dark:text-gray-300">
                            {(() => {
                              const content = post.content || '';
                              const isExpanded = expandedAdminPosts[post.id];
                              const shouldTruncate = content.length > 160;
                              if (!shouldTruncate || isExpanded) {
                                return content;
                              }
                              return `${content.substring(0, 160)}...`;
                            })()}
                          </p>
                          {(post.content || '').length > 160 && (
                            <button
                              type="button"
                              className="mt-1 text-sm font-semibold text-primary hover:text-green-700 transition-colors"
                              onClick={() =>
                                setExpandedAdminPosts((prev) => ({
                                  ...prev,
                                  [post.id]: !prev[post.id],
                                }))
                              }
                            >
                              {expandedAdminPosts[post.id] ? 'See less' : 'See more'}
                            </button>
                          )}
                        </div>
                      </div>

                      {(() => {
                        const media = post.media && Array.isArray(post.media) && post.media.length > 0
                          ? post.media
                          : (post.featured_image ? [{ url: post.featured_image, type: 'image' }] : []);
                        
                        if (media.length === 0) return null;

                        if (media.length === 1) {
                          const item = media[0];
                          return item.type === 'video' ? (
                            <video
                              className="w-full h-64 object-cover"
                              src={item.url}
                              controls
                            />
                          ) : (
                            <img
                              alt="Post featured image"
                              className="w-full h-64 object-cover"
                              src={item.url}
                            />
                          );
                        }

                        // Multiple media - show grid
                        return (
                          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-gray-800">
                            {media.slice(0, 4).map((item, index) => (
                              <div key={index} className="relative">
                                {item.type === 'video' ? (
                                  <video
                                    className="w-full h-32 object-cover"
                                    src={item.url}
                                    controls
                                  />
                                ) : (
                                  <img
                                    alt={`Post media ${index + 1}`}
                                    className="w-full h-32 object-cover"
                                    src={item.url}
                                  />
                                )}
                                {media.length > 4 && index === 3 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white font-bold">+{media.length - 4}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      <div className="p-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
                        <button
                          onClick={() => handleEdit(post)}
                          className="flex items-center gap-2 text-primary hover:text-green-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default Posts;

