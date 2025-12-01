import React, { useEffect, useMemo, useState } from 'react';
import { getPosts } from '../../services/postsService';

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

const ViewPost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [expandedPosts, setExpandedPosts] = useState({});

  useEffect(() => {
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

    fetchPosts();
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
                <div className="flex min-h-[280px] items-center justify-center text-white/70">
                  Loading posts...
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
                      className="rounded-2xl border border-primary/20 bg-black/40 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary whitespace-nowrap">
                            {post.category || 'Announcements'}
                          </span>
                          <span className="text-xs text-white/60">{formatDate(post.created_at)}</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-white leading-tight">{post.title}</h3>
                      <p className="text-white/80 text-sm leading-relaxed break-words">
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
                      {post.featured_image && (
                        <div className="overflow-hidden rounded-b-2xl border-t border-primary/20">
                          <div
                            className="aspect-[4/3] w-full bg-cover bg-center"
                            style={{ backgroundImage: `url("${post.featured_image}")` }}
                            role="img"
                            aria-label={post.title}
                          />
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
    </div>
  );
};

export default ViewPost;

