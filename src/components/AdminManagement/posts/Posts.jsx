import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getPosts, createPost, updatePost, deletePost, searchPosts } from '../../../services/postsService';
import { uploadImage } from '../../../services/imageUploadService';
import AdminLayout from '../AdminLayout';

const Posts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Announcements',
    featured_image: '',
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
        } catch (error) {
          console.error('Error searching posts:', error);
        }
      };
      searchPostsData();
    } else {
      fetchPosts();
    }
  }, [searchQuery]);

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

  const handleImageFile = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    handleImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      featured_image: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setUploading(true);
    
    try {
      let imageUrl = formData.featured_image;

      // Upload image if a new file is selected
      if (selectedFile) {
        try {
          imageUrl = await uploadImage(selectedFile, 'posts');
        } catch (uploadError) {
          console.error('Error uploading image, using base64 fallback:', uploadError);
          // Fallback to base64 if upload fails
          if (imagePreview) {
            imageUrl = imagePreview;
          }
        }
      }

      // Only set author_id if it's a valid UUID (not 'admin' string)
      const authorId = user?.id && user.id !== 'admin' ? user.id : null;

      const postData = {
        ...formData,
        featured_image: imageUrl,
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
    } catch (error) {
      console.error('Error saving post:', error);
      const errorMessage = error?.message || 'Error saving post. Please try again.';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      category: post.category || 'Announcements',
      featured_image: post.featured_image || '',
      status: post.status || 'Draft'
    });
    setImagePreview(post.featured_image || '');
    setSelectedFile(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'Announcements',
      featured_image: '',
      status: 'Draft'
    });
    setEditingPost(null);
    setSelectedFile(null);
    setImagePreview('');
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
      <main className="flex-1 overflow-y-auto bg-black/10 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-1">
            <p className="text-white text-3xl font-black leading-tight tracking-[-0.033em]">Post Management</p>
            <p className="text-[#7fe06c] text-sm font-medium">Create, edit, and manage all club posts and announcements.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Composer */}
            <section className="space-y-5 rounded-2xl border border-[#2b4c1f] bg-[#111b10] p-6 shadow-[0_20px_60px_rgba(5,10,4,0.6)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#6fb95b]">Post Builder</p>
                  <h2 className="text-white text-2xl font-semibold mt-1">
                    {editingPost ? 'Update Post' : 'Create New Post'}
                  </h2>
                  <p className="text-xs text-[#9fb99a] mt-1">
                    {editingPost ? 'Editing existing announcement' : 'Draft a new announcement for the club.'}
                  </p>
                </div>
                {editingPost && (
                  <span className="rounded-full bg-[#213318] px-3 py-1 text-xs font-semibold text-[#9bf781]">
                    Editing
                  </span>
                )}
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-semibold text-[#c7f5b8]" htmlFor="post-title">Post Title</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-[#385c2d] bg-[#0f160c] px-4 py-3 text-sm text-[#f1ffeb] placeholder:text-[#7d9b75] focus:border-[#6fe05f] focus:ring-2 focus:ring-[#6fe05f44]"
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
                  <label className="text-sm font-semibold text-[#c7f5b8]" htmlFor="post-content">Content</label>
                  <textarea
                    className="mt-2 w-full rounded-xl border border-[#385c2d] bg-[#0f160c] px-4 py-3 text-sm text-[#f1ffeb] placeholder:text-[#7d9b75] focus:border-[#6fe05f] focus:ring-2 focus:ring-[#6fe05f44]"
                    id="post-content"
                    name="content"
                    placeholder="Write your post content here..."
                    rows="6"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#c7f5b8]">Featured Image</label>
                  {imagePreview || (editingPost && formData.featured_image) ? (
                    <div className="relative mt-3 overflow-hidden rounded-xl border border-[#385c2d]">
                      <img
                        src={imagePreview || formData.featured_image}
                        alt="Preview"
                        className="h-48 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-3 top-3 rounded-full bg-[#f25757] p-2 text-white shadow-md hover:bg-[#ff7a7a]"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#3c5d31] bg-[#0b1208] px-6 py-8 text-center text-[#98c589] transition hover:border-[#6fe05f] hover:text-[#c9ffb8]"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <span className="material-symbols-outlined text-4xl mb-2">upload_file</span>
                      <p className="text-sm font-medium">Drag & drop or tap to upload</p>
                      <p className="text-xs text-[#6b8a63] mt-1">JPG/PNG, max 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    id="featured-image"
                    name="featured_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-[#c7f5b8]" htmlFor="category">Category</label>
                    <select
                      className="mt-2 w-full rounded-xl border border-[#385c2d] bg-[#0f160c] px-4 py-3 text-sm text-[#f1ffeb] focus:border-[#6fe05f] focus:ring-2 focus:ring-[#6fe05f44]"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option>Announcements</option>
                      <option>Race Reports</option>
                      <option>Club News</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#c7f5b8]">Status</span>
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-[#2c4520] bg-[#0c1209] px-4 py-2">
                      <span className={`text-xs font-semibold ${formData.status === 'Draft' ? 'text-[#f1ffeb]' : 'text-[#8aa07f]'}`}>Draft</span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          className="peer sr-only"
                          type="checkbox"
                          checked={formData.status === 'Published'}
                          onChange={handleStatusToggle}
                        />
                        <div className="h-6 w-11 rounded-full bg-[#23331a] transition peer-checked:bg-[#6fe05f]"></div>
                        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></div>
                      </label>
                      <span className={`text-xs font-semibold ${formData.status === 'Published' ? 'text-[#f1ffeb]' : 'text-[#8aa07f]'}`}>Published</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2 md:flex-row">
                  <button
                    className="flex-1 rounded-full bg-[#6fe05f] px-4 py-3 text-sm font-bold text-[#041005] shadow-lg shadow-[#6fe05f33] transition hover:bg-[#5ec84f] disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={uploading}
                  >
                    {uploading ? 'Saving...' : editingPost ? 'Update Post' : 'Save Post'}
                  </button>
                  <button
                    className="flex-1 rounded-full border border-[#36542a] px-4 py-3 text-sm font-semibold text-[#dcefd0] transition hover:bg-[#162110]"
                    type="button"
                    onClick={resetForm}
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>

            {/* Posts List */}
            <section className="lg:col-span-2 rounded-2xl border border-[#28441b] bg-[#080f08] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
              <div className="flex flex-col gap-3 pb-4">
                <div>
                  <p className="text-white text-2xl font-semibold">Existing Posts</p>
                  <p className="text-xs text-[#93b58c]">Review and manage announcements in one place.</p>
                </div>
                <label className="flex min-w-40 h-12 w-full rounded-full border border-[#2c4720] bg-[#0e150c] px-4 text-[#9cc097] focus-within:border-[#6fe05f] focus-within:ring-2 focus-within:ring-[#6fe05f33]">
                  <span className="flex items-center pr-3 text-[#6ca655]">
                    <span className="material-symbols-outlined text-base">search</span>
                  </span>
                  <input
                    className="w-full flex-1 bg-transparent text-sm text-white placeholder:text-[#6ca655] focus:outline-none"
                    placeholder="Filter posts by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>
              </div>

              {loading ? (
                <div className="py-10 text-center text-[#96b78e]">Loading posts...</div>
              ) : posts.length === 0 ? (
                <div className="py-10 text-center text-[#96b78e]">No posts found. Create your first post!</div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <article key={post.id} className="rounded-2xl border border-[#244019] bg-gradient-to-br from-[#10180e] to-[#0b1209] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-10 rounded-full border border-[#3a5b2f] bg-cover bg-center"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDAXt23xlpLChR-wdeFdGq9v8UFYq9UyGOM3nv5SOGrJzRXtbjWheLP6RwBXXYSp79k3G25giEzhJYchikYxDeIgCNe_JFD0XZIqcmMbhWTKXtr8AGIWo_jgfyL_zG6-lWwZFTNY60dX8TB8k2e2t1yiXtZK5krAJiOtGYc9Ot85xhj5UcRa7v9HElNACJkxNaZmPhr5T6G0FoUvs3_3rgsp9ARhcz153hSZG_KmsyFKbahYGZAUqfUvctYXnap2ZbRQcK7KqdddvE")' }}
                          ></div>
                          <div>
                            <p className="text-sm font-semibold text-white">Admin</p>
                            <p className="text-xs text-[#7ea373]">{formatDate(post.created_at)}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            post.status === 'Published'
                              ? 'bg-[#173115] text-[#87f676]'
                              : 'bg-[#221b11] text-[#f6d190]'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <h3 className="text-lg font-bold text-white">{post.title}</h3>
                        <p className="text-sm text-[#a6c39b] leading-relaxed line-clamp-3">
                          {post.content.length > 160 ? `${post.content.substring(0, 160)}...` : post.content}
                        </p>
                      </div>

                      {post.featured_image && (
                        <div
                          className="mt-4 overflow-hidden rounded-xl border border-[#2d4b20]"
                        >
                          <div
                            className="aspect-video w-full bg-cover bg-center"
                            style={{ backgroundImage: `url("${post.featured_image}")` }}
                          ></div>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-[#1f3117] pt-4 text-sm font-semibold">
                        <button
                          onClick={() => handleEdit(post)}
                          className="flex items-center gap-2 text-[#7ae769] hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="flex items-center gap-2 text-[#f26c6c] hover:text-[#ff9c9c] transition-colors"
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

