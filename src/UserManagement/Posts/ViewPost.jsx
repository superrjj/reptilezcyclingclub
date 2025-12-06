import React, { useEffect, useMemo, useState } from 'react';
import { getPosts } from '../../services/postsService';
import { fetchPostLikeSummary, removePostLike, upsertPostLike } from '../../services/postLikesService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useTabVisibility } from '../../hooks/useTabVisibility';

const fallbackPosts = [
  {
    id: 'demo-1',
    title: 'RCC Recruitment',
    content: 'Halina\'t sumali sa team at sabayan kami sa aming mga weekend long rides at races.',
    category: 'Announcements',
    status: 'Published',
    featured_image: '/latest_post.jpg',
    created_at: '2025-12-01T00:00:00.000Z',
  },
  {
    id: 'demo-2',
    title: 'Larga Pilipinas Championship',
    content: 'Congratulations sa buong team para sa panibagong podium finish!',
    category: 'Race Reports',
    status: 'Published',
    featured_image: '/upcoming_events.jpg',
    created_at: '2025-11-20T00:00:00.000Z',
  },
];

const MAX_PREVIEW_LENGTH = 150;

const categoryThemes = {
  Announcements: {
    badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30',
    avatar: 'bg-emerald-600/30 text-emerald-200 border border-emerald-400/50',
  },
  'Race Reports': {
    badge: 'bg-rose-500/15 text-rose-200 border border-rose-400/30',
    avatar: 'bg-rose-600/30 text-rose-200 border border-rose-400/40',
  },
  default: {
    badge: 'bg-primary/15 text-primary border border-primary/40',
    avatar: 'bg-primary/20 text-primary border border-primary/40',
  },
};

const getStoredLikes = () => {
  try {
    const stored = localStorage.getItem('rcc-post-likes');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Unable to parse stored likes', error);
    return {};
  }
};

const supabaseReady = isSupabaseConfigured;

const ViewPost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [expandedPosts, setExpandedPosts] = useState({});
  const [likedPosts, setLikedPosts] = useState(() => (supabaseReady ? {} : getStoredLikes()));
  const [likeCounts, setLikeCounts] = useState({});
  const [deviceFingerprint, setDeviceFingerprint] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);
  const [shareState, setShareState] = useState({ postId: null, message: '' });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getPosts();
      if (Array.isArray(data) && data.length > 0) {
        setPosts(data);
      } else {
        setPosts(fallbackPosts);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Unable to load posts from Supabase. Showing sample data for now.');
      setPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Auto-refresh when tab becomes visible
  useTabVisibility(fetchPosts);

  useEffect(() => {
    if (!supabaseReady) {
      localStorage.setItem('rcc-post-likes', JSON.stringify(likedPosts));
    }
  }, [likedPosts]);

  useEffect(() => {
    if (supabaseReady || Object.keys(likedPosts).length === 0) return;
    setLikeCounts(
      Object.keys(likedPosts).reduce((acc, postId) => {
        acc[postId] = 1;
        return acc;
      }, {})
    );
  }, [likedPosts]);

  useEffect(() => {
    const initFingerprint = async () => {
      try {
        let deviceId = localStorage.getItem('rcc-device-id');
        if (!deviceId) {
          deviceId =
            (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
            `device-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          localStorage.setItem('rcc-device-id', deviceId);
        }
        const model = navigator.userAgent || 'Unknown Device';
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown Region';
        const location = timezone;

        setDeviceFingerprint({
          id: deviceId,
          model,
          location,
        });
      } catch (fingerprintError) {
        console.error('Failed to initialize fingerprint', fingerprintError);
        setDeviceFingerprint({
          id: 'unknown',
          model: 'Unknown Device',
          location: 'Unknown Region',
        });
      }
    };

    initFingerprint();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) =>
      post.title?.toLowerCase().includes(search.toLowerCase()) ||
      post.content?.toLowerCase().includes(search.toLowerCase())
    );
  }, [posts, search]);

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date)) return '';
    const datePart = date.toLocaleDateString('en-US', {
      timeZone: 'Asia/Manila',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
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

  const getInitials = (name = '') => {
    const fallback = 'RCC';
    if (!name) return fallback;
    const trimmed = name.trim();
    if (!trimmed) return fallback;
    const parts = trimmed.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const getCategoryTheme = (category) => {
    if (!category) return categoryThemes.default;
    return categoryThemes[category] || categoryThemes.default;
  };

  useEffect(() => {
    if (!supabaseReady || !deviceFingerprint?.id) return;
    let isMounted = true;
    const loadSupabaseLikes = async () => {
      try {
        const { counts, likedPostIds } = await fetchPostLikeSummary(deviceFingerprint.id);
        if (!isMounted) return;
        setLikeCounts(counts);
        setLikedPosts(
          likedPostIds.reduce((acc, id) => {
            acc[id] = true;
            return acc;
          }, {})
        );
      } catch (likeError) {
        console.error('Failed to load like summary', likeError);
      }
    };
    loadSupabaseLikes();
    return () => {
      isMounted = false;
    };
  }, [deviceFingerprint]);

  const nextLikeValue = (current = 0, liked) => {
    if (liked) {
      return Math.max(0, current - 1);
    }
    return current + 1;
  };

  const heartCopy = (count, liked) => {
    if (count > 0) {
      if (liked) {
        return count === 1 ? 'You love this' : `You and ${count - 1} rider${count - 1 === 1 ? '' : 's'} love this`;
      }
      return `${count} rider${count === 1 ? '' : 's'} love this`;
    }
    return 'Be the first to send hearts';
  };

  const toggleLike = async (postId) => {
    if (!deviceFingerprint?.id) return;
    const alreadyLiked = !!likedPosts[postId];

    // Optimistic UI update
    setLikedPosts((prev) => {
      const next = { ...prev };
      if (alreadyLiked) {
        delete next[postId];
      } else {
        next[postId] = true;
      }
      return next;
    });
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: nextLikeValue(prev[postId], alreadyLiked),
    }));

    if (!supabaseReady) return;

    try {
      if (alreadyLiked) {
        await removePostLike(postId, deviceFingerprint.id);
      } else {
        await upsertPostLike(postId, deviceFingerprint);
      }
    } catch (likeError) {
      console.error('Unable to update like in Supabase', likeError);

      // Rollback optimistic update on error
      setLikedPosts((prev) => {
        const next = { ...prev };
        if (alreadyLiked) {
          // we removed it optimistically, add it back
          next[postId] = true;
        } else {
          // we added it optimistically, remove it
          delete next[postId];
        }
        return next;
      });
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: nextLikeValue(prev[postId], !alreadyLiked),
      }));

      setShareState({ postId, message: 'Unable to update hearts right now.' });
      setTimeout(() => {
        setShareState((prev) => (prev.postId === postId ? { postId: null, message: '' } : prev));
      }, 2500);
    }
  };

  const handleShare = async (post) => {
    const sharePayload = {
      title: post.title,
      text: post.content,
      url: `${window.location.origin}/posts#${post.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
        setShareState({ postId: post.id, message: 'Shared successfully!' });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(sharePayload.url);
        setShareState({ postId: post.id, message: 'Link copied to clipboard.' });
      } else {
        setShareState({ postId: post.id, message: 'Sharing not supported on this device.' });
      }
    } catch (shareError) {
      console.error('Share failed', shareError);
      setShareState({ postId: post.id, message: 'Share cancelled or failed.' });
    } finally {
      setTimeout(() => {
        setShareState((prev) => (prev.postId === post.id ? { postId: null, message: '' } : prev));
      }, 2500);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden text-white"
      style={{
        backgroundImage:
          'linear-gradient(135deg, #020202 0%, #0a2b0a 35%, #0b0b0b 65%, #2b0000 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="layout-container flex grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-2">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1 pt-3 md:pt-2 pb-8">
            <section className="space-y-3">
              <label className="flex min-w-40 h-12 w-full rounded-full border border-primary/40 bg-black/70 px-4 text-white backdrop-blur focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                <span className="flex items-center pr-3 text-primary/70">
                  <span className="material-symbols-outlined text-base">search</span>
                </span>
                <input
                  className="w-full flex-1 bg-transparent text-sm text-white placeholder:text-primary/70 focus:outline-none"
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              {error && (
                <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-white/90">
                  {error}
                </div>
              )}
            </section>
            <div className="mt-6">
              {loading ? (
                <div className="space-y-4 pb-12">
                  {[1, 2, 3].map((skeleton) => (
                    <div
                      key={skeleton}
                      className="overflow-hidden rounded-3xl border border-white/5 bg-black/40 p-5 md:p-6 space-y-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full shimmer-bg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-40 rounded-full shimmer-bg" />
                          <div className="h-2 w-24 rounded-full shimmer-bg" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 rounded-full shimmer-bg" />
                        <div className="h-3 w-full rounded-full shimmer-bg" />
                        <div className="h-3 w-5/6 rounded-full shimmer-bg" />
                      </div>
                      <div className="h-40 w-full rounded-2xl shimmer-bg" />
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="flex min-h-[280px] items-center justify-center text-white/60">
                  No posts matched your search.
                </div>
              ) : (
                <div className="space-y-6 pb-12">
                  {filteredPosts.map((post) => (
                    <article
                      key={post.id}
                      className="overflow-hidden rounded-3xl border border-white/5 bg-black/40 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-md"
                    >
                      <div className="space-y-4 p-5 md:p-6">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="relative">
                            <div className="flex size-12 items-center justify-center rounded-full border-2 border-primary/60 bg-black/40 p-[3px]">
                              <img
                                src="/rcc1.png"
                                alt="Reptilez Cycling Club avatar"
                                className="h-10 w-10 rounded-full object-contain"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <p className="text-base font-semibold text-white">
                              {post.author_name || 'Reptilez Cycling Club'}
                            </p>
                            <p className="text-xs text-white/60">{formatDate(post.created_at)}</p>
                          </div>
                          <span
                            className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getCategoryTheme(post.category).badge}`}
                          >
                            {post.category || 'Updates'}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold text-white leading-snug">{post.title}</h3>
                          <p className="whitespace-pre-line text-white/80 text-sm leading-relaxed break-words">
                            {(() => {
                              const content = post.content || '';
                              const isExpanded = expandedPosts[post.id];
                              const shouldTruncate = content.length > MAX_PREVIEW_LENGTH;
                              if (!shouldTruncate || isExpanded) {
                                return content;
                              }
                              return `${content.substring(0, MAX_PREVIEW_LENGTH)}...`;
                            })()}
                          </p>
                          {(post.content || '').length > MAX_PREVIEW_LENGTH && (
                            <button
                              type="button"
                              className="text-primary font-semibold text-xs hover:text-white transition-colors"
                              onClick={() =>
                                setExpandedPosts((prev) => ({
                                  ...prev,
                                  [post.id]: !prev[post.id],
                                }))
                              }
                            >
                              {expandedPosts[post.id] ? 'See less' : 'See more'}
                            </button>
                          )}
                        </div>
                      </div>
                      {(() => {
                        // Get media array or fallback to featured_image for backward compatibility
                        const media = post.media && Array.isArray(post.media) && post.media.length > 0
                          ? post.media
                          : (post.featured_image ? [{ url: post.featured_image, type: 'image' }] : []);

                        if (media.length === 0) return null;

                        // Single image/video - full width display
                        if (media.length === 1) {
                          const item = media[0];
                          return (
                            <div className="relative flex w-full overflow-hidden border-y border-white/5">
                              {item.type === 'video' ? (
                                <video
                                  className="w-full aspect-video object-cover"
                                  src={item.url}
                                  controls
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <button
                                  type="button"
                                  className="group relative flex w-full overflow-hidden focus:outline-none"
                                  onClick={() =>
                                    setActiveMedia({
                                      src: item.url,
                                      title: post.title,
                                      meta: post.category,
                                    })
                                  }
                                  aria-label={`View full image for ${post.title}`}
                                >
                                  <div
                                    className="aspect-video w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.02]"
                                    style={{ backgroundImage: `url("${item.url}")` }}
                                    role="img"
                                    aria-label={post.title}
                                  />
                                </button>
                              )}
                            </div>
                          );
                        }

                        // Multiple images/videos - grid layout (Facebook style)
                        const allMedia = media;
                        const displayCount = Math.min(allMedia.length, 5);
                        const remainingCount = allMedia.length > 5 ? allMedia.length - 5 : 0;

                        // Determine grid layout based on count
                        const getGridClass = (count) => {
                          if (count === 1) return 'grid-cols-1';
                          if (count === 2) return 'grid-cols-2';
                          if (count === 3) return 'grid-cols-2';
                          if (count === 4) return 'grid-cols-2';
                          return 'grid-cols-3';
                        };

                        return (
                          <div className="border-y border-white/5 bg-black/20 p-1">
                            <div className={`grid ${getGridClass(displayCount)} gap-1`}>
                              {allMedia.slice(0, displayCount).map((item, index) => {
                                // For 3 items: first item spans 2 rows
                                const isLarge = (allMedia.length === 3 && index === 0) || 
                                             (allMedia.length === 4 && index === 0);
                                
                                return (
                                  <div
                                    key={index}
                                    className={`relative overflow-hidden ${
                                      isLarge ? 'row-span-2' : ''
                                    }`}
                                    style={{ 
                                      aspectRatio: isLarge ? '1' : '1',
                                      minHeight: isLarge ? '400px' : '200px'
                                    }}
                                  >
                                    {item.type === 'video' ? (
                                      <video
                                        className="w-full h-full object-cover cursor-pointer"
                                        src={item.url}
                                        controls
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <button
                                        type="button"
                                        className="group relative w-full h-full focus:outline-none"
                                        onClick={() =>
                                          setActiveMedia({
                                            src: item.url,
                                            title: post.title,
                                            meta: post.category,
                                          })
                                        }
                                      >
                                        <div
                                          className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                                          style={{ backgroundImage: `url("${item.url}")` }}
                                        />
                                        {remainingCount > 0 && index === 4 && (
                                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                            <span className="text-white text-3xl font-bold">+{remainingCount}</span>
                                          </div>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                      <div className="flex flex-wrap items-center gap-3 border-t border-white/5 bg-black/30 px-5 py-3 text-xs text-white/70 md:px-6">
                        <span className="flex items-center gap-2">
                          <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1">
                            <span
                              className={`material-symbols-outlined text-base ${likedPosts[post.id] ? 'text-rose-400' : 'text-primary'}`}
                              style={likedPosts[post.id] ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                              favorite
                            </span>
                            <span className="text-xs font-semibold text-white/80">
                              {likeCounts[post.id] ?? 0}
                            </span>
                          </span>
                          <span>{heartCopy(likeCounts[post.id] ?? 0, !!likedPosts[post.id])}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base text-primary">share</span>
                          Share-ready post
                        </span>
                      </div>
                      <div className="flex divide-x divide-white/5 border-t border-white/5 bg-black/20">
                        {[
                          { label: likedPosts[post.id] ? 'Liked' : 'Heart', icon: 'favorite', onClick: () => toggleLike(post.id), active: likedPosts[post.id] },
                          { label: 'Share', icon: 'ios_share', onClick: () => handleShare(post), active: false },
                        ].map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            onClick={action.onClick}
                            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-white/5 ${
                              action.active ? 'text-primary' : 'text-white/70'
                            }`}
                          >
                            <span
                              className="material-symbols-outlined text-base"
                              style={action.icon === 'favorite' && action.active ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                              {action.icon}
                            </span>
                            {action.label}
                          </button>
                        ))}
                      </div>
                      {shareState.postId === post.id && shareState.message && (
                        <div className="border-t border-white/5 bg-black/30 px-5 py-2 text-xs text-primary md:px-6">
                          {shareState.message}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {activeMedia && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 px-4 backdrop-blur">
          <button
            type="button"
            className="absolute right-6 top-6 rounded-full border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
            onClick={() => setActiveMedia(null)}
            aria-label="Close media viewer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-[0_40px_140px_rgba(0,0,0,0.85)]">
            <div className="flex max-h-[80vh] items-center justify-center bg-black">
              <img
                src={activeMedia.src}
                alt={activeMedia.title}
                className="max-h-[80vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="border-t border-white/10 px-6 py-4 text-center text-white/80">
              <p className="text-lg font-semibold">{activeMedia.title}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">{activeMedia.meta}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPost;

