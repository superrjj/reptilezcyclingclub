import React, { useState, useEffect, useRef } from 'react';
import GradientText from '../../components/ui/gradient-text';

const AboutUsSection = () => {
    const [visibleSections, setVisibleSections] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

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
                    About Us
                </GradientText>
                <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-reptilez-green-600 to-transparent rounded-full"></div>
            </div>

            {/* Hero Image - Full Screen */}
            <div
                id="about-hero"
                data-animate-about
                className={`flex flex-col gap-6 transition-all duration-1000 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16 ${visibleSections['about-hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-screen overflow-hidden">
                    <div
                        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                        style={{ backgroundImage: 'url("/rcc_bg.jpg")' }}
                        role="img"
                        aria-label="Reptilez Cycling Club team photo"
                    />
                </div>
            </div>

            {/* Mission & Vision */}
            <div
                id="about-mv"
                data-animate-about
                className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 transition-all duration-1000 ${visibleSections['about-mv'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <div className="bg-white border border-reptilez-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm hover:border-reptilez-green-400 transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <span className="material-symbols-outlined text-reptilez-green-600 text-3xl sm:text-4xl">flag</span>
                        <h2 className="text-gray-900 text-xl sm:text-2xl font-bold">Our Mission</h2>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                        To nurture and develop young and youth riders into competitive athletes who will become
                        a source of pride for Tarlac and Pangasinan. We are committed to providing comprehensive
                        training that develops not just athletic prowess, but also instills good manners and right
                        conduct in every rider.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        Through dedicated coaching, structured programs, and a supportive community, we transform
                        promising young cyclists into disciplined athletes who excel both on and off the bike,
                        representing our provinces with honor and integrity.
                    </p>
                </div>

                <div className="bg-white border border-reptilez-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm hover:border-reptilez-green-400 transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <span className="material-symbols-outlined text-reptilez-green-600 text-3xl sm:text-4xl">visibility</span>
                        <h2 className="text-gray-900 text-xl sm:text-2xl font-bold">Our Vision</h2>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                        To establish a premier Amateur cycling team in Tarlac Province that competes at the highest
                        national level races. We envision RCC as a model club and team that serves as an inspiration
                        and blueprint for upcoming amateur teams across the country.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
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
                    <h2 className="text-gray-900 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                        Our Core Objectives
                    </h2>
                    <p className="text-gray-600 text-base font-normal leading-normal">
                        The pillars that guide our journey and define our purpose.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {objectives.map((objective, index) => (
                        <div
                            key={index}
                            className={`bg-white border border-reptilez-green-200 rounded-xl p-6 backdrop-blur-sm hover:border-reptilez-green-400 transition-all duration-300 ${visibleSections['about-obj'] ? 'animate-fadeInUp' : 'opacity-0'
                                }`}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-reptilez-green-50 border border-reptilez-green-300 ${objective.color} ${objective.bgGlow}`}>
                                    <span className="material-symbols-outlined text-2xl">{objective.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-gray-900 text-xl font-bold mb-2">{objective.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{objective.description}</p>
                                </div>
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
                    <h2 className="text-gray-900 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                        Our Core Values
                    </h2>
                    <p className="text-gray-600 text-base font-normal leading-normal">
                        The principles that guide everything we do.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {values.map((value, index) => (
                        <div
                            key={index}
                            className={`bg-white border border-reptilez-green-200 rounded-xl p-6 backdrop-blur-sm hover:border-reptilez-green-400 transition-all duration-300 ${visibleSections['about-val'] ? 'animate-fadeInUp' : 'opacity-0'
                                }`}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-reptilez-green-50 border border-reptilez-green-300 ${value.color}`}>
                                    <span className="material-symbols-outlined text-2xl">{value.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-gray-900 text-xl font-bold mb-2">{value.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                                </div>
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