import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../../hooks/usePageMeta';

const AboutUsPage = () => {
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState({});

  usePageMeta('About Us');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (navigator.onLine) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          await fetch('https://www.google.com/favicon.ico', {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          setTimeout(() => setLoading(false), 300);
        } else {
          setTimeout(() => setLoading(false), 1000);
        }
      } catch (error) {
        setTimeout(() => setLoading(false), 800);
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    if (!loading) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections(prev => ({
                ...prev,
                [entry.target.id]: true
              }));
            }
          });
        },
        { threshold: 0.1 }
      );

      document.querySelectorAll('[data-animate]').forEach((el) => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }
  }, [loading]);

  const values = [
    {
      title: 'Passion for Cycling',
      description: 'We ride with heart, pushing boundaries and celebrating every mile.',
      icon: 'pedal_bike',
      color: 'text-emerald-400',
      glowColor: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]'
    },
    {
      title: 'Community First',
      description: 'Building lasting friendships and supporting each other on and off the road.',
      icon: 'groups',
      color: 'text-primary',
      glowColor: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]'
    },
    {
      title: 'Excellence',
      description: 'Striving for personal bests while maintaining sportsmanship and respect.',
      icon: 'star',
      color: 'text-yellow-400',
      glowColor: 'shadow-[0_0_30px_rgba(250,204,21,0.3)]'
    },
    {
      title: 'Adventure',
      description: 'Exploring new routes, challenging terrains, and creating unforgettable memories.',
      icon: 'explore',
      color: 'text-blue-400',
      glowColor: 'shadow-[0_0_30px_rgba(96,165,250,0.3)]'
    },
  ];

  const objectives = [
    {
      title: 'Youth Development',
      description: 'Nurturing young and youth riders to develop into competitive athletes who will become a source of pride for Tarlac and Pangasinan. We provide comprehensive training programs designed to unlock their full potential.',
      icon: 'sports',
      color: 'text-primary',
      bgGlow: 'bg-primary/5'
    },
    {
      title: 'Character Building',
      description: 'While developing their athletic talents, we coach our riders to have good manners and right conduct. We believe that true champions are defined not just by their victories, but by their character and integrity.',
      icon: 'school',
      color: 'text-emerald-400',
      bgGlow: 'bg-emerald-400/5'
    },
    {
      title: 'National Competition',
      description: 'Establishing a premier Amateur team in Tarlac Province that races competitively at the national level. We compete in major races across the country, showcasing the talent and determination of our riders.',
      icon: 'emoji_events',
      color: 'text-yellow-400',
      bgGlow: 'bg-yellow-400/5'
    },
    {
      title: 'Model Club',
      description: 'Serving as a model club and team that inspires upcoming amateur teams. We share our knowledge, best practices, and experiences to help build a stronger cycling community nationwide.',
      icon: 'auto_awesome',
      color: 'text-blue-400',
      bgGlow: 'bg-blue-400/5'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 sm:gap-8 md:gap-12 pb-6 sm:pb-8 md:pb-12 px-3 sm:px-4 md:px-6">
        <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
          <div className="relative w-full h-80 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden border border-primary/30 shimmer-bg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((item) => (
            <div key={item} className="bg-black/40 border border-primary/30 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full shimmer-bg" />
                <div className="h-6 w-32 rounded-full shimmer-bg" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded-full shimmer-bg" />
                <div className="h-4 w-full rounded-full shimmer-bg" />
                <div className="h-4 w-5/6 rounded-full shimmer-bg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section with Parallax Effect */}
      <div 
        id="hero" 
        data-animate
        className={`flex flex-col gap-6 transition-all duration-1000 ${
          visibleSections['hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden border border-primary/30 group shadow-[0_20px_80px_rgba(34,197,94,0.15)] hover:shadow-[0_20px_100px_rgba(34,197,94,0.25)] transition-all duration-700">
          <div 
            className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: 'url("/rcc_bg.jpg")' }}
            role="img"
            aria-label="Reptilez Cycling Club team photo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
           
          </div>
        </div>
      </div>

      {/* Mission & Vision with Flip Animation */}
      <div 
        id="mission-vision" 
        data-animate
        className={`grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 transition-all duration-1000 ${
          visibleSections['mission-vision'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="bg-black/40 border border-primary/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm hover:border-primary/70 transition-all duration-500 group perspective-1000 hover:shadow-[0_0_40px_rgba(34,197,94,0.2)] hover:-translate-y-2">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-primary text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">flag</span>
            <h2 className="text-white text-xl sm:text-2xl font-bold">Our Mission</h2>
          </div>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 group-hover:text-white/90 transition-colors duration-300">
            To nurture and develop young and youth riders into competitive athletes who will become 
            a source of pride for Tarlac and Pangasinan. We are committed to providing comprehensive 
            training that develops not just athletic prowess, but also instills good manners and right 
            conduct in every rider.
          </p>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed group-hover:text-white/90 transition-colors duration-300">
            Through dedicated coaching, structured programs, and a supportive community, we transform 
            promising young cyclists into disciplined athletes who excel both on and off the bike, 
            representing our provinces with honor and integrity.
          </p>
        </div>

        <div className="bg-black/40 border border-primary/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm hover:border-primary/70 transition-all duration-500 group perspective-1000 hover:shadow-[0_0_40px_rgba(34,197,94,0.2)] hover:-translate-y-2">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-primary text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">visibility</span>
            <h2 className="text-white text-xl sm:text-2xl font-bold">Our Vision</h2>
          </div>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 group-hover:text-white/90 transition-colors duration-300">
            To establish a premier Amateur cycling team in Tarlac Province that competes at the highest 
            national level races. We envision RCC as a model club and team that serves as an inspiration 
            and blueprint for upcoming amateur teams across the country.
          </p>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed group-hover:text-white/90 transition-colors duration-300">
            We strive to be recognized not only for our competitive achievements but also for our 
            commitment to youth development, character building, and excellence in sportsmanship. 
            Our goal is to create a legacy that inspires future generations of cyclists.
          </p>
        </div>
      </div>

      {/* Objectives with Stagger Animation */}
      <div 
        id="objectives" 
        data-animate
        className={`flex flex-col gap-6 transition-all duration-1000 ${
          visibleSections['objectives'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] drop-shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            Our Core Objectives
          </h2>
          <p className="text-primary/70 text-base font-normal leading-normal">
            The pillars that guide our journey and define our purpose.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {objectives.map((objective, index) => (
            <div
              key={index}
              className={`bg-black/40 border border-primary/30 rounded-xl p-6 backdrop-blur-sm hover:border-primary/70 transition-all duration-500 group hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:-translate-y-2 ${
                visibleSections['objectives'] ? 'animate-fadeInUp' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-black/60 border border-primary/30 ${objective.color} group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 ${objective.bgGlow}`}>
                  <span className="material-symbols-outlined text-2xl group-hover:animate-pulse">{objective.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">{objective.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                    {objective.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values with Glow Effect */}
      <div 
        id="values" 
        data-animate
        className={`flex flex-col gap-6 transition-all duration-1000 ${
          visibleSections['values'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] drop-shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            Our Core Values
          </h2>
          <p className="text-primary/70 text-base font-normal leading-normal">
            The principles that guide everything we do.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className={`bg-black/40 border border-primary/30 rounded-xl p-6 backdrop-blur-sm hover:border-primary/70 transition-all duration-500 group hover:-translate-y-2 ${value.glowColor} ${
                visibleSections['values'] ? 'animate-fadeInUp' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-black/60 border border-primary/30 ${value.color} group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500`}>
                  <span className="material-symbols-outlined text-2xl group-hover:animate-bounce">{value.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">{value.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">{value.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Footer with Fade In */}
      <div 
        id="footer" 
        data-animate
        className={`flex justify-center items-center pt-8 border-t border-primary/20 transition-all duration-1000 ${
          visibleSections['footer'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <p className="text-white/50 text-sm font-normal">
          Developed by <span className="text-primary/70 font-semibold hover:text-primary transition-colors duration-300 cursor-pointer">John Harvee Quirido</span>
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .shimmer-bg {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(34, 197, 94, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUsPage;