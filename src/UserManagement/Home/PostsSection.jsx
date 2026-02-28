import React, { useEffect, useState, useRef } from 'react';
import { getPosts } from '../../services/postsService';
import GradientText from '../../components/ui/gradient-text';

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

const categoryThemes = {
    Announcements: {
        badge: 'bg-reptilez-green-100 text-reptilez-green-700 border border-reptilez-green-300',
    },
    'Race Reports': {
        badge: 'bg-red-100 text-red-700 border border-red-300',
    },
    default: {
        badge: 'bg-reptilez-green-100 text-reptilez-green-700 border border-reptilez-green-300',
    },
};

const POSTS_PER_PAGE = 3;

const PostsSection = ({ refreshFunctionsRef }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const sectionRef = useRef(null);

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
            setError('Unable to load posts. Showing sample data.');
            setPosts(fallbackPosts);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Register refresh function
    useEffect(() => {
        if (refreshFunctionsRef?.current) {
            const index = refreshFunctionsRef.current.length;
            refreshFunctionsRef.current.push(fetchPosts);
            return () => {
                refreshFunctionsRef.current = refreshFunctionsRef.current.filter((_, i) => i !== index);
            };
        }
    }, [refreshFunctionsRef]);

    // Scroll-based animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setIsVisible(true);
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        const currentRef = sectionRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
            observer.disconnect();
        };
    }, []);

    // Modal keyboard controls
    useEffect(() => {
        if (!selectedPost) return;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedPost(null);
            } else if (e.key === 'ArrowRight') {
                handleNextMedia();
            } else if (e.key === 'ArrowLeft') {
                handlePrevMedia();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPost, currentMediaIndex]);

    const formatDate = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date)) return '';
        return date.toLocaleDateString('en-US', {
            timeZone: 'Asia/Manila',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
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

    const openPostViewer = (post) => {
        setCurrentMediaIndex(0);
        setSelectedPost(post);
    };

    const handleNextMedia = () => {
        if (!selectedPost) return;
        const media = getPostMedia(selectedPost).filter(m => m.type === 'image');
        if (currentMediaIndex < media.length - 1) {
            setCurrentMediaIndex(prev => prev + 1);
        }
    };

    const handlePrevMedia = () => {
        if (currentMediaIndex > 0) {
            setCurrentMediaIndex(prev => prev - 1);
        }
    };

    const MAX_PREVIEW = 120;
    const visiblePosts = showAll ? posts : posts.slice(0, POSTS_PER_PAGE);
    const hasMore = posts.length > POSTS_PER_PAGE;

    return (
        <>
            <section
                id="posts"
                ref={sectionRef}
                data-animate
                style={{ scrollMarginTop: '6rem' }}
                className={`w-full flex flex-col items-center gap-8 py-4 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
                {/* Animated Title with Gradient */}
                <div className={`text-center space-y-2 transition-all duration-1000 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
                }`}>
                    <GradientText
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight"
                        animationDuration={2}
                    >
                        Posts of Reptilez Cycling Club
                    </GradientText>
                    <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-reptilez-green-600 to-transparent rounded-full"></div>
                </div>

                {error && (
                    <div className="w-full max-w-6xl rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                {/* Cards Grid */}
                <div className="w-full max-w-6xl flex flex-col gap-6">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((skeleton) => (
                                <div key={skeleton} className="bg-white border border-reptilez-green-200 rounded-xl overflow-hidden shadow-sm">
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
                        <div className="flex min-h-[200px] items-center justify-center text-gray-600 bg-white rounded-xl border border-reptilez-green-100 p-8">
                            No posts available yet.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visiblePosts.map((post, index) => {
                                    const coverImage = getCoverImage(post);
                                    const mediaCount = getPostMedia(post).filter(m => m.type === 'image').length;
                                    const content = post.content || '';
                                    const truncated = content.length > MAX_PREVIEW
                                        ? content.substring(0, MAX_PREVIEW) + '...'
                                        : content;

                                    return (
                                        <div
                                            key={post.id}
                                            className="bg-white border border-reptilez-green-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-reptilez-green-400 transition-all duration-300 cursor-pointer group flex flex-col"
                                            onClick={() => openPostViewer(post)}
                                            style={{ animationDelay: `${index * 80}ms` }}
                                        >
                                            {/* Cover Image */}
                                            <div className="relative h-52 bg-gradient-to-br from-reptilez-green-50 to-reptilez-green-100 overflow-hidden">
                                                {coverImage ? (
                                                    <img
                                                        src={coverImage}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-6xl text-reptilez-green-300">article</span>
                                                    </div>
                                                )}
                                                {mediaCount > 1 && (
                                                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-sm">
                                                        <span className="material-symbols-outlined text-sm">photo_library</span>
                                                        {mediaCount}
                                                    </div>
                                                )}
                                                <div className="absolute bottom-3 left-3">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getCategoryTheme(post.category).badge} backdrop-blur-sm`}>
                                                        {post.category || 'Updates'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="p-5 flex flex-col flex-1 gap-2">
                                                <h3 className="text-gray-900 text-lg font-bold leading-snug line-clamp-2 group-hover:text-reptilez-green-700 transition-colors">
                                                    {post.title}
                                                </h3>
                                                <p className="text-gray-500 text-xs">{formatDate(post.created_at)}</p>
                                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">{truncated}</p>
                                                <div className="mt-3 pt-3 border-t border-reptilez-green-100">
                                                    <span className="text-reptilez-green-600 text-sm font-semibold group-hover:text-reptilez-green-700 transition-colors flex items-center gap-1">
                                                        View Post
                                                        <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* See More / See Less Button */}
                            {hasMore && (
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setShowAll(!showAll)}
                                        className="px-8 py-3 rounded-full border-2 border-reptilez-green-600 text-reptilez-green-700 font-semibold text-sm hover:bg-reptilez-green-600 hover:text-white transition-all duration-300 flex items-center gap-2"
                                    >
                                        {showAll
                                            ? 'Show Less'
                                            : `See More Posts (${posts.length - POSTS_PER_PAGE} more)`}
                                        <span
                                            className="material-symbols-outlined text-base transition-transform duration-300"
                                            style={{ transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                        >
                                            expand_more
                                        </span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Post Viewer Modal */}
            {selectedPost && (() => {
                const allImages = getPostMedia(selectedPost).filter(m => m.type === 'image');
                const currentImage = allImages[currentMediaIndex];

                return (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                        onClick={() => setSelectedPost(null)}
                    >
                        <button
                            type="button"
                            className="absolute right-4 top-4 sm:right-6 sm:top-6 z-20 rounded-full border border-reptilez-green-200 bg-white/90 p-2.5 sm:p-3 text-gray-700 hover:bg-reptilez-green-600 hover:text-white focus:outline-none transition-all duration-300 hover:scale-110 shadow-lg"
                            onClick={(e) => { e.stopPropagation(); setSelectedPost(null); }}
                            aria-label="Close"
                        >
                            <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
                        </button>

                        <div
                            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-reptilez-green-200 bg-white shadow-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {allImages.length > 0 && (
                                <div className="relative bg-reptilez-green-50">
                                    <div className="flex items-center justify-center min-h-[300px] max-h-[60vh]">
                                        <img
                                            src={currentImage?.url}
                                            alt={selectedPost.title}
                                            className="w-full max-h-[60vh] object-contain"
                                        />
                                    </div>

                                    {currentMediaIndex > 0 && (
                                        <button
                                            type="button"
                                            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm border border-reptilez-green-200 flex items-center justify-center text-gray-700 hover:bg-reptilez-green-600 hover:border-reptilez-green-600 hover:text-white transition-all duration-300 shadow-lg"
                                            onClick={() => setCurrentMediaIndex(prev => prev - 1)}
                                            aria-label="Previous image"
                                        >
                                            <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_left</span>
                                        </button>
                                    )}

                                    {currentMediaIndex < allImages.length - 1 && (
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm border border-reptilez-green-200 flex items-center justify-center text-gray-700 hover:bg-reptilez-green-600 hover:border-reptilez-green-600 hover:text-white transition-all duration-300 shadow-lg"
                                            onClick={() => setCurrentMediaIndex(prev => prev + 1)}
                                            aria-label="Next image"
                                        >
                                            <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_right</span>
                                        </button>
                                    )}

                                    {allImages.length > 1 && (
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 text-white text-sm font-semibold backdrop-blur-sm">
                                            {currentMediaIndex + 1} / {allImages.length}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="p-6 sm:p-8 space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full border-2 border-reptilez-green-300 bg-reptilez-green-50 p-[2px]">
                                            <img src="/rcc1.png" alt="RCC" className="h-8 w-8 rounded-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{selectedPost.author_name || 'Reptilez Cycling Club'}</p>
                                            <p className="text-xs text-gray-500">{formatDate(selectedPost.created_at)}</p>
                                        </div>
                                    </div>
                                    <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getCategoryTheme(selectedPost.category).badge}`}>
                                        {selectedPost.category || 'Updates'}
                                    </span>
                                </div>

                                <h2 className="text-gray-900 text-2xl sm:text-3xl font-bold leading-snug">{selectedPost.title}</h2>
                                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line break-words">
                                    {selectedPost.content}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </>
    );
};

export default PostsSection;