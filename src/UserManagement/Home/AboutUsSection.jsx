import React, { useState, useEffect, useRef } from 'react';
import GradientText from '../../components/ui/gradient-text';
import { getMembers } from '../../services/membersService';
import { getPosts } from '../../services/postsService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import PublicAuthDialog from '../PublicAuthDialog';

const AboutUsSection = () => {
    const [visibleSections, setVisibleSections] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);
    const [stats, setStats] = useState({ posts: 0, members: 0 });
    const [followers, setFollowers] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [publicUserId, setPublicUserId] = useState(null);

    // Fixed ID representing this website/page (followers follow THIS only)
    const PAGE_PROFILE_ID = '11111111-1111-1111-1111-111111111111';

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setVisibleSections(prev => ({
                        ...prev,
                        [entry.target.id]: entry.isIntersecting
                    }));
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        document.querySelectorAll('[data-animate-about]').forEach((el) => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    // Section-level visibility for title animation
    useEffect(() => {
        const titleObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => setIsVisible(entry.isIntersecting));
            },
            { threshold: 0.1 }
        );

        const currentRef = sectionRef.current;
        if (currentRef) titleObserver.observe(currentRef);
        return () => {
            if (currentRef) titleObserver.unobserve(currentRef);
            titleObserver.disconnect();
        };
    }, []);

    // Load total posts and total members from Supabase (via services)
    useEffect(() => {
        const loadStats = async () => {
            try {
                const [posts, members] = await Promise.all([getPosts(), getMembers()]);
                const publishedPosts = (posts || []).filter(
                    (post) => !post.status || post.status === 'Published'
                );
                setStats({
                    posts: publishedPosts.length,
                    members: (members || []).length,
                });
            } catch (error) {
                console.error('Error loading AboutUs stats:', error);
            }
        };

        loadStats();
    }, []);

    // Load current public user from localStorage (custom public auth)
    useEffect(() => {
        try {
            const raw = localStorage.getItem('rcc-public-user');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.id) {
                    setPublicUserId(parsed.id);
                }
            }
        } catch (e) {
            console.error('Error reading public user from storage:', e);
        }
    }, []);

    // Load followers count + whether current public user follows the page
    useEffect(() => {
        const loadFollowState = async () => {
            if (!isSupabaseConfigured || !supabase) return;
            if (PAGE_PROFILE_ID === 'REPLACE_WITH_PAGE_PROFILE_ID') return;

            try {
                const { count, error } = await supabase
                    .from('page_followers')
                    .select('*', { count: 'exact', head: true })
                    .eq('page_profile_id', PAGE_PROFILE_ID);

                if (!error) setFollowers(count || 0);

                if (publicUserId) {
                    const { data, error: followError } = await supabase
                        .from('page_followers')
                        .select('id')
                        .eq('page_profile_id', PAGE_PROFILE_ID)
                        .eq('follower_profile_id', publicUserId)
                        .maybeSingle();

                    if (!followError) setIsFollowing(!!data);
                } else {
                    setIsFollowing(false);
                }
            } catch (e) {
                console.error('Error loading follow state:', e);
            }
        };

        loadFollowState();
    }, [publicUserId]);

    const handleFollowClick = async () => {
        if (!publicUserId) {
            setAuthOpen(true);
            return;
        }
        if (!isSupabaseConfigured || !supabase) return;
        if (PAGE_PROFILE_ID === 'REPLACE_WITH_PAGE_PROFILE_ID') return;

        setFollowLoading(true);
        try {
            if (isFollowing) {
                const { error } = await supabase
                    .from('page_followers')
                    .delete()
                    .eq('page_profile_id', PAGE_PROFILE_ID)
                    .eq('follower_profile_id', publicUserId);

                if (!error) {
                    setIsFollowing(false);
                    setFollowers((prev) => Math.max(0, prev - 1));
                }
            } else {
                const { error } = await supabase.from('page_followers').insert({
                    page_profile_id: PAGE_PROFILE_ID,
                    follower_profile_id: publicUserId,
                });

                if (!error) {
                    setIsFollowing(true);
                    setFollowers((prev) => prev + 1);
                }
            }
        } catch (e) {
            console.error('Error toggling follow:', e);
        } finally {
            setFollowLoading(false);
        }
    };

    const values = [
        {
            title: 'Passion for Cycling',
            description: 'We ride with heart, pushing boundaries and celebrating every mile.',
            icon: 'pedal_bike',
            color: 'text-emerald-600',
        },
        {
            title: 'Community First',
            description: 'Building lasting friendships and supporting each other on and off the road.',
            icon: 'groups',
            color: 'text-reptilez-green-600',
        },
        {
            title: 'Excellence',
            description: 'Striving for personal bests while maintaining sportsmanship and respect.',
            icon: 'star',
            color: 'text-yellow-600',
        },
        {
            title: 'Adventure',
            description: 'Exploring new routes, challenging terrains, and creating unforgettable memories.',
            icon: 'explore',
            color: 'text-blue-600',
        },
    ];

    const objectives = [
        {
            title: 'Youth Development',
            description: 'Nurturing young and youth riders to develop into competitive athletes who will become a source of pride for Tarlac and Pangasinan. We provide comprehensive training programs designed to unlock their full potential.',
            icon: 'sports',
            color: 'text-reptilez-green-600',
            bgGlow: 'bg-reptilez-green-50'
        },
        {
            title: 'Character Building',
            description: 'While developing their athletic talents, we coach our riders to have good manners and right conduct. We believe that true champions are defined not just by their victories, but by their character and integrity.',
            icon: 'school',
            color: 'text-emerald-600',
            bgGlow: 'bg-emerald-50'
        },
        {
            title: 'National Competition',
            description: 'Establishing a premier Amateur team in Tarlac Province that races competitively at the national level. We compete in major races across the country, showcasing the talent and determination of our riders.',
            icon: 'emoji_events',
            color: 'text-yellow-600',
            bgGlow: 'bg-yellow-50'
        },
        {
            title: 'Model Club',
            description: 'Serving as a model club and team that inspires upcoming amateur teams. We share our knowledge, best practices, and experiences to help build a stronger cycling community nationwide.',
            icon: 'auto_awesome',
            color: 'text-blue-600',
            bgGlow: 'bg-blue-50'
        }
    ];

    return (
        <section
            id="about-us"
            ref={sectionRef}
            className="flex flex-col gap-12"
            style={{ scrollMarginTop: '6rem' }}
        >

            {/* Animated Title with Gradient */}
            <div className={`text-center space-y-2 transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
            }`}>
                <GradientText
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight"
                    animationDuration={2}
                >
                    About D&amp;R Margin Racing 
                </GradientText>
                <div className="w-24 h-1 mx-auto bg-black/10 rounded-full"></div>
            </div>

            {/* Hero Image + Profile Header (parang FB/IG page) */}
            <div
                id="about-hero"
                data-animate-about
                className={`flex flex-col gap-6 transition-all duration-1000 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16 ${visibleSections['about-hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                {/* Cover photo */}
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/10] lg:aspect-[21/9] xl:aspect-[3/1] overflow-hidden min-h-[380px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[80vh] xl:min-h-[110vh]">
                    <div
                        className="absolute inset-0 bg-bottom bg-cover bg-no-repeat"
                        style={{ backgroundImage: 'url("/rcc_bg.jpg")' }}
                        role="img"
                        aria-label="Reptilez Cycling Club team photo"
                    />
                </div>

                {/* Profile card overlapped sa baba ng cover image */}
                <div className="-mt-16 sm:-mt-20 md:-mt-24 px-4 sm:px-8 md:px-12 lg:px-20">
                    <div className="w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.18)] border border-gray-100 px-5 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                        {/* Avatar */}
                        <div className="relative -mt-10 sm:-mt-12 md:-mt-14 flex justify-center sm:block w-full sm:w-auto">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-[4px] border-white shadow-[0_10px_25px_rgba(15,23,42,0.4)] bg-gray-200">
                                <img
                                    src="/rcc3.png"
                                    alt="D&R Margin Racing"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Name + stats + button (static for now; later wired to Supabase) */}
                        <div className="flex-1 w-full flex flex-col sm:flex-row md:flex-row md:items-center md:justify-between flex-wrap items-center sm:items-end gap-4 sm:gap-8">
                            <div className="text-center sm:text-left">
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#111827]">
                                    D&amp;R Margin Racing
                                </h2>
                                <div className="mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                                    <p className="text-xs sm:text-sm text-[#4B5563]">
                                        Official cycling team page
                                    </p>
                                    <span
                                        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-500/15 text-sky-600"
                                        aria-label="Verified"
                                        title="Verified"
                                    >
                                        <span className="material-symbols-outlined text-[14px] leading-none">
                                            verified
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-wrap justify-center md:justify-center gap-6 md:gap-10 text-xs sm:text-sm text-[#111827]">
                                <div className="text-center">
                                    <div className="font-bold text-base sm:text-lg">
                                        {stats.posts}
                                    </div>
                                    <div className="text-[#6B7280] text-[11px] sm:text-xs uppercase tracking-wide">
                                        Posts
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-base sm:text-lg">{followers}</div>
                                    <div className="text-[#6B7280] text-[11px] sm:text-xs uppercase tracking-wide">
                                        Followers
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-base sm:text-lg">
                                        {stats.members}
                                    </div>
                                    <div className="text-[#6B7280] text-[11px] sm:text-xs uppercase tracking-wide">
                                        Members
                                    </div>
                                </div>
                            </div>

                            <div className="w-full sm:w-auto flex justify-center sm:justify-end md:self-center">
                                <button
                                    type="button"
                                    onClick={handleFollowClick}
                                    disabled={followLoading}
                                    className={`inline-flex items-center justify-center px-6 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide shadow-md transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                                        isFollowing
                                            ? 'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200'
                                            : 'bg-reptilez-green-600 text-white hover:bg-reptilez-green-700'
                                    }`}
                                >
                                    {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PublicAuthDialog open={authOpen} onClose={() => setAuthOpen(false)} defaultMode="register" />

            {/* Mission & Vision */}
            <div
                id="about-mv"
                data-animate-about
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 transition-all duration-1000 ${visibleSections['about-mv'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="material-symbols-outlined text-reptilez-green-600 text-3xl sm:text-4xl">flag</span>
                        <h2 className="text-[#111827] text-xl sm:text-2xl font-bold">Our Mission</h2>
                    </div>
                    <p className="text-[#374151] text-sm sm:text-base leading-relaxed">
                        To nurture and develop young and youth riders into competitive athletes who will become
                        a source of pride for Tarlac and Pangasinan. We are committed to providing comprehensive
                        training that develops not just athletic prowess, but also instills good manners and right
                        conduct in every rider.
                    </p>
                    <p className="text-[#374151] text-sm sm:text-base leading-relaxed">
                        Through dedicated coaching, structured programs, and a supportive community, we transform
                        promising young cyclists into disciplined athletes who excel both on and off the bike,
                        representing our provinces with honor and integrity.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="material-symbols-outlined text-reptilez-green-600 text-3xl sm:text-4xl">visibility</span>
                        <h2 className="text-[#111827] text-xl sm:text-2xl font-bold">Our Vision</h2>
                    </div>
                    <p className="text-[#374151] text-sm sm:text-base leading-relaxed">
                        To establish a premier Amateur cycling team in Tarlac Province that competes at the highest
                        national level races. We envision RCC as a model club and team that serves as an inspiration
                        and blueprint for upcoming amateur teams across the country.
                    </p>
                    <p className="text-[#374151] text-sm sm:text-base leading-relaxed">
                        We strive to be recognized not only for our competitive achievements but also for our
                        commitment to youth development, character building, and excellence in sportsmanship.
                        Our goal is to create a legacy that inspires future generations of cyclists.
                    </p>
                </div>
            </div>

            {/* Objectives */}
            <div
                id="about-obj"
                data-animate-about
                className={`flex flex-col gap-6 transition-all duration-1000 ${visibleSections['about-obj'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <div className="flex flex-col gap-2">
                    <h2 className="text-[#111827] text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                        Our Core Objectives
                    </h2>
                    <p className="text-[#374151] text-base font-normal leading-normal">
                        The pillars that guide our journey and define our purpose.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {objectives.map((objective, index) => (
                        <div
                            key={index}
                            data-animate-about
                            className={`flex items-start gap-4 py-4 ${visibleSections['about-obj'] ? 'animate-fadeInUp opacity-100' : 'opacity-0'
                                }`}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className={`flex items-center justify-center w-12 h-12 rounded-lg shrink-0 ${objective.color} ${objective.bgGlow}`}>
                                <span className="material-symbols-outlined text-2xl">{objective.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[#111827] text-lg font-bold mb-2">{objective.title}</h3>
                                <p className="text-[#374151] text-sm leading-relaxed">{objective.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Values */}
            <div
                id="about-val"
                data-animate-about
                className={`flex flex-col gap-6 transition-all duration-1000 ${visibleSections['about-val'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <div className="flex flex-col gap-2">
                    <h2 className="text-[#111827] text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                        Our Core Values
                    </h2>
                    <p className="text-[#374151] text-base font-normal leading-normal">
                        The principles that guide everything we do.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {values.map((value, index) => (
                        <div
                            key={index}
                            data-animate-about
                            className={`flex items-start gap-4 py-4 ${visibleSections['about-val'] ? 'animate-fadeInUp opacity-100' : 'opacity-0'
                                }`}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className={`flex items-center justify-center w-12 h-12 rounded-lg shrink-0 bg-reptilez-green-50 ${value.color}`}>
                                <span className="material-symbols-outlined text-2xl">{value.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[#111827] text-lg font-bold mb-2">{value.title}</h3>
                                <p className="text-[#374151] text-sm leading-relaxed">{value.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
            `}</style>
        </section>
    );
};

export default AboutUsSection;